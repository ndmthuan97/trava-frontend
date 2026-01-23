import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelMenuModule } from 'primeng/panelmenu';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, PanelMenuModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  @Input() open = true;
}
