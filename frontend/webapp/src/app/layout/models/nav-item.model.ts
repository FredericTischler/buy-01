export interface NavItem {
  label: string;
  route: string;
  icon?: string;
  roles?: string[];
  exact?: boolean;
  children?: NavItem[];
}
