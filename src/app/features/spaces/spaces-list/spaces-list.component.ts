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
import { PopoverModule } from 'primeng/popover';
import { SpaceType, SpaceTypeLabels } from '../../../shared/models/enum/space-type.enum';
import { SpaceRole, SpaceRoleLabels } from '../../../shared/models/enum/space-role.enum';

@Component({
  selector: 'app-spaces-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SpaceCardComponent, CreateSpaceComponent, ButtonModule, InputTextModule, FormsModule, PopoverModule],
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
  filterType = signal<number | null>(null);
  filterRole = signal<number | null>(null);
  private readonly searchSubject = new Subject<string>();

  // Expose for template
  SpaceType = SpaceType;
  SpaceRole = SpaceRole;
  SpaceTypeLabels = SpaceTypeLabels;
  SpaceRoleLabels = SpaceRoleLabels;

  typeFilterOptions = [
    { label: 'Personal', value: SpaceType.Personal },
    { label: 'Team', value: SpaceType.Team }
  ];

  roleFilterOptions = [
    { label: 'Owner', value: SpaceRole.Owner },
    { label: 'Member', value: SpaceRole.Member }
  ];

  ngOnInit(): void {
    this.loadSpaces();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
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
    const type = this.filterType();
    const role = this.filterRole();
    
    this.spaceService.getSpacesByUserId(term, type ?? undefined, role ?? undefined).subscribe({
      next: spaces => {
        if (!Array.isArray(spaces)) {
          this.spaces.set([]);
          return;
        }
        this.spaces.set(spaces);
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

  onFilterTypeChange(type: number | null) {
    this.filterType.set(type);
    this.loadSpaces();
  }

  onFilterRoleChange(role: number | null) {
    this.filterRole.set(role);
    this.loadSpaces();
  }
}
