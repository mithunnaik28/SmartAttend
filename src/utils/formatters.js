import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';

export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  try {
    return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
  } catch {
    return dateStr;
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatTime(dateStr) {
  if (!dateStr) return '-';
  try {
    return format(new Date(dateStr), 'h:mm a');
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '-';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function isSessionExpired(expiresAt) {
  if (!expiresAt) return true;
  try {
    return isBefore(new Date(expiresAt), new Date());
  } catch {
    return true;
  }
}

export function formatPercentage(value, total) {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
}
