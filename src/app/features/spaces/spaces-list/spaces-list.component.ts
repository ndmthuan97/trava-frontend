import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SpaceService } from '../../../shared/services/api/space/space.service';
import { Space } from '../../../shared/models/entities/space.model';
import { SpaceCardComponent } from '../space-card/space-card.component';
import { CreateSpaceComponent } from '../create-space/create-space.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-spaces-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SpaceCardComponent, CreateSpaceComponent, ButtonModule],
  templateUrl: './spaces-list.component.html',
  styleUrl: './spaces-list.component.css'
})
export class SpacesListComponent implements OnInit {
  private readonly spaceService = inject(SpaceService);
  private readonly router = inject(Router);
  
  spaces = signal<Space[]>([]);
  showAddSpaceDialog = signal(false);

  ngOnInit(): void {
    this.loadSpaces();
  }

  loadSpaces(): void {
    this.spaceService.getSpacesByUserId().subscribe({
      next: spaces => {
        if (!Array.isArray(spaces)) {
          this.spaces.set([]);
          return;
        }
        // Add a default member count for visual verification
        const spacesWithMembers = spaces.map(s => ({
          ...s,
          memberCount: s.memberCount ?? 1
        }));
        this.spaces.set(spacesWithMembers);
      },
      error: err => console.error('Failed to load spaces', err)
    });
  }

  addSpace() {
    this.showAddSpaceDialog.set(true);
  }

  onSpaceSelect(space: Space) {
    this.router.navigate(['/spaces', space.id]);
  }
}
