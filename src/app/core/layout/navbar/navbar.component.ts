import { SpaceService } from './../../../shared/services/api/space/space.service';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Space } from '../../../shared/models/entities/space.model';

import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { SpaceType } from '../../../shared/models/enum/space-type.enum';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { Select } from 'primeng/select';
import { CreateSpaceComponent } from '../../../features/spaces/create-space/create-space.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    PanelMenuModule,
    MenuModule,
    DialogComponent,
    FormsModule,
    InputText,
    InputTextarea,
    Select,
    CreateSpaceComponent,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  open = input<boolean>(true);

  private readonly spaceService = inject(SpaceService);

  isSpacesExpanded = signal(false);

  spaces = signal<Space[]>([]);
  menuItems = signal<MenuItem[]>([]);

  ngOnInit(): void {
    this.loadSpaces();
  }

  loadSpaces(): void {
    this.spaceService.getSpacesByUserId().subscribe({
      next: spaces => {
        this.spaces.set(spaces);
        this.updateMenuItems();
      },
      error: err => {
        console.error('Load spaces failed', err);
        this.spaces.set([]);
        this.updateMenuItems();
      },
    });
  }

  selectedSpace = signal<any>(null);
  mainSpaceMenuItems = signal<MenuItem[]>([]);
  showAddSpaceDialog = signal(false);

  updateMenuItems() {
    this.menuItems.set([
      {
        label: 'Spaces',
        icon: 'pi pi-box',
        expanded: this.isSpacesExpanded(),
        items: this.spaces().map(space => ({
          label: space.name,
          icon: 'pi pi-folder',
          command: () => console.log('Selected space:', space),
        })),
      },
    ]);

    this.mainSpaceMenuItems.set([
      {
        label: 'Add',
        icon: 'pi pi-plus',
        command: () => this.addSpace(),
      },
      { separator: true },
      ...this.spaces().map(space => ({
        label: space.name,
        icon: 'pi pi-folder',
        command: () => console.log('Selected space:', space),
      })),
    ]);
  }

  itemSpaceMenuItems = signal<MenuItem[]>([
    {
      label: 'Rename',
      icon: 'pi pi-pencil',
      command: () => this.renameSpace(this.selectedSpace()),
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => this.deleteSpace(this.selectedSpace()),
    },
  ]);

  toggleSpaces() {
    this.isSpacesExpanded.update(v => !v);
    if (this.menuItems().length > 0) {
      this.menuItems()[0].expanded = this.isSpacesExpanded();
    }
  }

  openMainSpaceMenu(event: Event, menu: any) {
    event.stopPropagation();
    menu.toggle(event);
  }

  openSpaceMenu(event: Event, space: any, menu: any) {
    event.stopPropagation();
    this.selectedSpace.set(space);
    menu.toggle(event);
  }

  addSpace() {
    this.showAddSpaceDialog.set(true);
  }


  renameSpace(space: any) {
    console.log('Rename space:', space);
    // TODO: Implement rename logic
  }

  deleteSpace(space: any) {
    console.log('Delete space:', space);
    // TODO: Implement delete logic
  }
}
