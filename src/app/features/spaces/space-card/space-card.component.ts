import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Space } from '../../../shared/models/entities/space.model';
import { SpaceType, SpaceTypeLabels } from '../../../shared/models/enum/space-type.enum';
import { SpaceRole, SpaceRoleLabels } from '../../../shared/models/enum/space-role.enum';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-space-card',
  standalone: true,
  imports: [CommonModule, TooltipModule, ButtonModule, MenuModule, TooltipModule],
  templateUrl: './space-card.component.html',
  styleUrl: './space-card.component.css',
})
export class SpaceCardComponent {
  space = input.required<Space>();
  active = input<boolean>(false);
  open = input<boolean>(true);

  edit = output<Space>();
  delete = output<Space>();

  isOwner = computed(() => this.space().role === SpaceRole.Owner);

  menuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => this.edit.emit(this.space()),
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      class: 'delete-item',
      command: () => this.delete.emit(this.space()),
    },
  ];

  spaceTypeLabel = computed(() => {
    return SpaceTypeLabels[this.space().spaceType] || 'Unknown';
  });

  spaceRoleLabel = computed(() => {
    const role = this.space().role;
    if (role !== undefined && role !== null) {
      return SpaceRoleLabels[role] || 'Unknown';
    }
    return 'Unknown';
  });

  onActionClick(event: Event) {
    event.stopPropagation();
  }
}
