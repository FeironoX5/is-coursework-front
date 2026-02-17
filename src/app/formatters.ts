export const upperCaseFormatter = (s: string): string =>
  String(s).charAt(0).toUpperCase() +
  String(s).slice(1).toLowerCase();

export const enumFormatter = (s: string): string =>
  String(s).split('_').join(' ');

export const roleFormatter = (s: string): string =>
  s.split('_').slice(1).join('_').toLowerCase();

export const camelFormatter = (s: string): string =>
  s.replace(/([a-z])([A-Z])/g, '$1 $2');
