export interface NavItem {
  path: string
  label: string
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home', icon: '📊' },
  { path: '/checklist', label: 'Checklist', icon: '✅' },
  { path: '/timer', label: 'Timer', icon: '⏱️' },
  { path: '/weights', label: 'Weights', icon: '🏋️' },
  { path: '/running', label: 'Running', icon: '🏃' },
  { path: '/rope', label: 'Rope', icon: '🪢' },
  { path: '/tennis', label: 'Tennis', icon: '🎾' },
  { path: '/goals', label: 'Goals', icon: '🎯' },
]
