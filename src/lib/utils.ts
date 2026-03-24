import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, isPast } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLPA(amount: number) {
  return `₹${amount} LPA`;
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getDeadlineLabel(deadline: string) {
  if (isPast(new Date(deadline))) return 'Closed';
  return `Closes ${formatDistanceToNow(new Date(deadline), { addSuffix: true })}`;
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'applied': return 'info';
    case 'shortlisted': return 'warning';
    case 'selected': return 'success';
    case 'rejected': return 'error';
    default: return 'default';
  }
}

export const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Other',
];

export const COMPANY_COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-indigo-500 to-blue-600',
];

export function getCompanyColor(name: string) {
  const idx = name.charCodeAt(0) % COMPANY_COLORS.length;
  return COMPANY_COLORS[idx];
}
