export interface NavItem {
  href: string;
  label: string;
  icon: string; // lucide name
}

/** Primary destinations — mirror the Flutter bottom-nav tabs. */
export const PRIMARY_NAV: NavItem[] = [
  { href: '/', label: 'Home', icon: 'house' },
  { href: '/insights', label: 'Insights', icon: 'chart-line' },
  { href: '/recurring', label: 'Recurring', icon: 'repeat' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
];

/** Secondary destinations — surfaced in the desktop sidebar + mobile quick actions. */
export const SECONDARY_NAV: NavItem[] = [
  { href: '/people', label: 'People', icon: 'users' },
  { href: '/budget', label: 'Budget', icon: 'flag' },
  { href: '/categories', label: 'Categories', icon: 'shapes' },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
