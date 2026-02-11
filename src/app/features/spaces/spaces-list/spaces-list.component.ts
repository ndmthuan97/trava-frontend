import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SpaceService } from '../../../shared/services/api/space/space.service';
import { Space } from '../../../shared/models/entities/space.model';
import { SpaceCardComponent } from '../space-card/space-card.component';
import { CreateSpaceComponent } from '../create-space/create-space.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-spaces-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SpaceCardComponent, CreateSpaceComponent, ButtonModule, InputTextModule, FormsModule],
  templateUrl: './spaces-list.component.html',
  styleUrl: './spaces-list.component.css'
})
export class SpacesListComponent implements OnInit {
  private readonly spaceService = inject(SpaceService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  
  spaces = signal<Space[]>([]);
  showAddSpaceDialog = signal(false);
  searchTerm = signal<string>('');
  private readonly searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadSpaces();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.loadSpaces();
    });
  }

  onSearchTriggered(term: string) {
    this.searchSubject.next(term);
  }

  loadSpaces(): void {
    const term = this.searchTerm();
    this.spaceService.getSpacesByUserId(term).subscribe({
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
