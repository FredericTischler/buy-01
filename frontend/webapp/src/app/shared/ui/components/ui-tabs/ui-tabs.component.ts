import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
} from '@angular/core';

import { UiTabPanelDirective } from '../../directives/ui-tab-panel.directive';

export interface UiTabItem {
  label: string;
  value: string;
  badge?: string | number;
  disabled?: boolean;
}

@Component({
  selector: 'ui-tabs',
  templateUrl: './ui-tabs.component.html',
  styleUrl: './ui-tabs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTabsComponent implements AfterContentInit {
  @Input() tabs: UiTabItem[] = [];
  @Input() activeTab?: string;

  @Output() activeTabChange = new EventEmitter<string>();

  @ContentChildren(UiTabPanelDirective) panels?: QueryList<UiTabPanelDirective>;

  ngAfterContentInit(): void {
    if (!this.activeTab) {
      this.activeTab = this.firstAvailableTab();
    }
  }

  get currentTab(): string | undefined {
    return this.activeTab ?? this.firstAvailableTab();
  }

  get currentPanel(): UiTabPanelDirective | undefined {
    const current = this.currentTab;
    if (!current || !this.panels) {
      return undefined;
    }

    return this.panels.find(panel => panel.name === current);
  }

  protected selectTab(tab: UiTabItem): void {
    if (tab.disabled || tab.value === this.currentTab) {
      return;
    }

    this.activeTab = tab.value;
    this.activeTabChange.emit(tab.value);
  }

  protected isActive(tab: UiTabItem): boolean {
    return tab.value === this.currentTab;
  }

  private firstAvailableTab(): string | undefined {
    const enabledTabs = this.tabs.filter(tab => !tab.disabled);
    if (enabledTabs.length > 0) {
      return enabledTabs[0]?.value;
    }

    return this.panels?.find(panel => !!panel.name)?.name;
  }
}
