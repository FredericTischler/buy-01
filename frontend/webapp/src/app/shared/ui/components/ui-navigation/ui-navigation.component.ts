import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface UiNavigationItem {
  label: string;
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'ui-navigation',
  templateUrl: './ui-navigation.component.html',
  styleUrl: './ui-navigation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiNavigationComponent {
  @Input() items: UiNavigationItem[] = [];
}
