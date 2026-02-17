import { FieldConfig } from '../components/dynamic-form/dynamic-form';

export type ArtStyle =
  | 'PAINTING'
  | 'SCULPTURE'
  | 'PERFORMANCE'
  | 'MULTIMEDIA'
  | 'DIGITAL_ART'
  | 'PHOTO'
  | 'OTHER';

export type AchievementType =
  | 'EDUCATION'
  | 'EXHIBITION'
  | 'PUBLICATION'
  | 'AWARD'
  | 'AUTO';

export interface Artist {
  userId: number;
  email: string;
  name: string;
  surname: string;
  location: string;
  biography: string;
}

export interface ArtWork {
  id: number;
  title: string;
  description: string;
  artDirection: ArtStyle;
  date: string;
  link: string;
}

export interface Achievement {
  id: number;
  type: AchievementType;
  title: string;
  description: string;
  link: string;
}
