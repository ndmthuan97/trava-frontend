import { CommonModule } from '@angular/common';
import { Component, input, model, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [ButtonModule, InputTextModule, CommonModule, DialogModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css',
})
export class DialogComponent {
  header = input<string>('');
  description = input<string>('');
  visible = model<boolean>(false);
  customeClass = input<string>('');
  width = input<string>('25rem');

  confirmLabel = input<string>('');
  cancelLabel = input<string>('');

  confirm = output<void>();
  cancel = output<void>();

  showDialog() {
    this.visible.set(true);
  }

  hideDialog() {
    this.visible.set(false);
  }

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
    this.hideDialog();
  }
}
