// ============================================================
// formatters.ts — Display formatters used across the app
// ============================================================

import type {
  ApplicationStatus,
  UserRole,
  ValidationStatus,
  AchievementType,
  ArtDirection,
} from './models';

export function enumFormatter(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function upperCaseFormatter(value: string): string {
  return value.toUpperCase();
}

export function capitalizeFormatter(value: string): string {
  return value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function roleFormatter(role: string): string {
  const map: Record<string, string> = {
    ROLE_ARTIST: 'Artist',
    ROLE_EXPERT: 'Expert',
    ROLE_RESIDENCE_ADMIN: 'Residence Admin',
    ROLE_SUPERADMIN: 'Super Admin',
  };
  return map[role] ?? enumFormatter(role);
}

export function applicationStatusLabel(
  status: ApplicationStatus
): string {
  const map: Record<ApplicationStatus, string> = {
    SENT: 'Submitted',
    REVIEWED: 'Under Review',
    APPROVED: 'Approved',
    RESERVE: 'Reserve List',
    REJECTED: 'Rejected',
    CONFIRMED: 'Confirmed',
    DECLINED_BY_ARTIST: 'Declined by Artist',
  };
  return map[status] ?? enumFormatter(status);
}

export function applicationStatusColor(
  status: ApplicationStatus
): 'primary' | 'accent' | 'warn' | '' {
  const map: Record<
    ApplicationStatus,
    'primary' | 'accent' | 'warn' | ''
  > = {
    SENT: '',
    REVIEWED: 'accent',
    APPROVED: 'primary',
    RESERVE: 'accent',
    REJECTED: 'warn',
    CONFIRMED: 'primary',
    DECLINED_BY_ARTIST: 'warn',
  };
  return map[status] ?? '';
}

export function validationStatusLabel(
  status: ValidationStatus
): string {
  const map: Record<ValidationStatus, string> = {
    PENDING: 'Pending Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  };
  return map[status];
}

export function achievementTypeLabel(type: AchievementType): string {
  const map: Record<AchievementType, string> = {
    EDUCATION: 'Education',
    EXHIBITION: 'Exhibition',
    PUBLICATION: 'Publication',
    AWARD: 'Award',
    AUTO: 'Other',
  };
  return map[type] ?? enumFormatter(type);
}

export function artDirectionLabel(dir: ArtDirection): string {
  const map: Record<ArtDirection, string> = {
    PAINTING: 'Painting',
    SCULPTURE: 'Sculpture',
    PERFORMANCE: 'Performance',
    MULTIMEDIA: 'Multimedia',
    DIGITAL_ART: 'Digital Art',
    PHOTO: 'Photography',
    OTHER: 'Other',
  };
  return map[dir] ?? enumFormatter(dir);
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function daysUntil(
  isoDate: string | undefined
): number | null {
  if (!isoDate) return null;
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}
