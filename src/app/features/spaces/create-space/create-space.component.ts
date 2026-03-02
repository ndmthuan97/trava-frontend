import { Component, inject, model, output, signal, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { Select } from 'primeng/select';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { SpaceType } from '../../../shared/models/enum/space-type.enum';
import { SpaceService } from '../../../shared/services/api/space/space.service';
import { CreateSpaceRequest } from '../../../shared/models/request/space-request.model';
import { ToastService } from '../../../shared/services/core/toast/toast.service';
import { Space } from '../../../shared/models/entities/space.model';

@Component({
  selector: 'app-create-space',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, InputTextarea, Select, DialogComponent],
  templateUrl: './create-space.component.html',
})
export class CreateSpaceComponent {
  private readonly spaceService = inject(SpaceService);
  private readonly toastService = inject(ToastService);

  visible = model<boolean>(false);
  spaceToEdit = input<Space | null>(null);
  created = output<void>();

  spaceData = signal({
    name: '',
    description: '',
    spaceType: SpaceType.Personal,
  });

  typeOptions = [
    { label: 'Personal', value: SpaceType.Personal },
    { label: 'Team', value: SpaceType.Team },
  ];

  constructor() {
    effect(
      () => {
        const space = this.spaceToEdit();
        if (space) {
          this.spaceData.set({
            name: space.name,
            description: space.description || '',
            spaceType: space.spaceType,
          });
        } else {
          this.resetSpaceForm();
        }
      },
      { allowSignalWrites: true }
    );
  }

  confirmAddSpace() {
    if (!this.spaceData().name) {
      this.toastService.error('Validation Error', 'Name is required');
      return;
    }

    const spaceToEdit = this.spaceToEdit();
    const data = this.spaceData();

    if (spaceToEdit) {
      this.spaceService
        .updateSpace(spaceToEdit.id, {
          name: data.name,
          description: data.description || undefined,
        })
        .subscribe({
          next: res => {
            if (res) {
              this.visible.set(false);
              this.created.emit();
              this.resetSpaceForm();
            }
          },
        });
    } else {
      const request: CreateSpaceRequest = {
        name: data.name,
        description: data.description || null,
        spaceType: data.spaceType === SpaceType.Personal ? 0 : 1,
      };

      this.spaceService.createSpace(request).subscribe({
        next: res => {
          if (res) {
            this.visible.set(false);
            this.created.emit();
            this.resetSpaceForm();
          }
        },
      });
    }
  }

  cancelAddSpace() {
    this.visible.set(false);
    this.resetSpaceForm();
  }

  resetSpaceForm() {
    this.spaceData.set({
      name: '',
      description: '',
      spaceType: SpaceType.Personal,
    });
  }
}
