import { ArtStyle } from './artist.model';

export interface Expert {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specializations: ArtStyle[];
  experienceDescription?: string;
}

export interface Evaluation {
  id: string;
  applicationId: string;
  expertId: string;
  score: number;
  comment: string;
  evaluatedAt: string;
}
