// Navigation definition. Items reference route names only — whether an item
// is VISIBLE is derived from that route's meta via checkAccess(), so menu
// visibility and route-guard rules can never drift apart.
// `short` is the single-word label used by the compact (phone) tab bar.
export const navigation = [
  {
    section: 'General',
    items: [
      { label: 'Dashboard', short: 'Home', icon: 'house', to: { name: 'dashboard' } },
      { label: 'My Tasks', short: 'Tasks', icon: 'checklist', to: { name: 'tasks' } },
      { label: 'My Profile', short: 'Profile', icon: 'person', to: { name: 'profile' } },
    ],
  },
  {
    section: 'Administration',
    items: [
      { label: 'Users', short: 'Users', icon: 'people', to: { name: 'admin-users' } },
      { label: 'Reports', short: 'Reports', icon: 'chart', to: { name: 'admin-reports' } },
      { label: 'Settings', short: 'Settings', icon: 'sliders', to: { name: 'admin-settings' } },
    ],
  },
];
