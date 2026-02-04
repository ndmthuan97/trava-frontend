import { Component, inject, model, output, signal } from '@angular/core';
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

  confirmAddSpace() {
    const request: CreateSpaceRequest = {
      name: this.spaceData().name,
      // send null when description is empty to match backend expectations
      description: this.spaceData().description || null,
      spaceType: this.spaceData().spaceType === SpaceType.Personal ? 0 : 1,
    };

    this.spaceService.createSpace(request).subscribe({
      next: res => {
        if (res) {
          this.toastService.success('Success', 'Space created successfully');
          this.visible.set(false);
          this.created.emit();
          this.resetSpaceForm();
        } else {
          this.toastService.error('Error', 'Failed to create space');
        }
      },
      error: () => {
        this.toastService.error('Error', 'Failed to create space');
      },
    });
  }

  cancelAddSpace() {
    this.visible.set(false);
  }

  resetSpaceForm() {
    this.spaceData.set({
      name: '',
      description: '',
      spaceType: SpaceType.Personal,
    });
  }
}
