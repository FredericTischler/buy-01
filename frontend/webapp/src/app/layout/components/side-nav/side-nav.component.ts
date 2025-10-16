import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { NavItem } from '../../models/nav-item.model';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavComponent {
  @Input() items: NavItem[] = [];
  @Input() quickLinks: NavItem[] = [];
  @Input() open = false;
  @Output() dismiss = new EventEmitter<void>();
  @Input() variant: 'overlay' | 'static' = 'static';
}
