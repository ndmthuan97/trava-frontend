import { ChangeDetectionStrategy, Component, Input, HostBinding } from '@angular/core';

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'success'
  | 'outline'
  | 'info'
  | 'warning'
  | 'danger'
  | 'dark'
  | 'gray'
  | 'orange'
  | 'purple';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [],
  template: '<span class="truncate block max-w-full"><ng-content></ng-content></span>',
  styleUrl: './badge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';

  @HostBinding('class')
  get hostClasses(): string {
    return this.getBadgeClasses(this.variant);
  }

  private getBadgeClasses(variant: BadgeVariant): string {
    const baseClasses =
      'inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

    const variantClasses: Record<BadgeVariant, string> = {
      default: 'border-zinc-200 bg-zinc-100 text-zinc-900 shadow-sm',
      success: 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm',
      secondary: 'border-zinc-900 bg-zinc-800 text-zinc-50 shadow-sm',
      destructive: 'border-rose-200 bg-rose-50 text-rose-700 shadow-sm',
      outline: 'border-zinc-300 bg-transparent text-zinc-700',
      info: 'border-sky-200 bg-sky-50 text-sky-700 shadow-sm',
      warning: 'border-amber-200 bg-amber-50 text-amber-700 shadow-sm',
      danger: 'border-rose-200 bg-rose-50 text-rose-700 shadow-sm',
      dark: 'border-zinc-800 bg-zinc-900 text-zinc-50 shadow-sm',
      gray: 'border-zinc-200 bg-zinc-100 text-zinc-800 shadow-sm',
      orange: 'border-orange-200 bg-orange-50 text-orange-700 shadow-sm',
      purple: 'border-purple-200 bg-purple-50 text-purple-700 shadow-sm',
    };

    return `${baseClasses} ${variantClasses[variant]}`;
  }
}
