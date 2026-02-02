import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Space } from '../../../shared/models/entities/space.model';
import { SpaceType } from '../../../shared/models/enum/space-type.enum';

@Component({
  selector: 'app-space-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './space-card.component.html',
  styleUrl: './space-card.component.css'
})
export class SpaceCardComponent {
  space = input.required<Space>();
  active = input<boolean>(false);
  open = input<boolean>(true);

  spaceTypeLabel = computed(() => {
    return this.space().spaceType === SpaceType.Personal ? 'Personal' : 'Team';
  });
}
