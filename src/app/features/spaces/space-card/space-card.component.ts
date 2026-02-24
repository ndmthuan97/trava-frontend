import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Space } from '../../../shared/models/entities/space.model';
import { SpaceType, SpaceTypeLabels } from '../../../shared/models/enum/space-type.enum';
import { SpaceRoleLabels } from '../../../shared/models/enum/space-role.enum';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-space-card',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  templateUrl: './space-card.component.html',
  styleUrl: './space-card.component.css'
})
export class SpaceCardComponent {
  space = input.required<Space>();
  active = input<boolean>(false);
  open = input<boolean>(true);

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
}
