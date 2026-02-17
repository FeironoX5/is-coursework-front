export type ApplicationStatus =
  | 'SENT'
  | 'REVIEWED'
  | 'APPROVED'
  | 'RESERVE'
  | 'REJECTED'
  | 'CONFIRMED'
  | 'DECLINED_BY_ARTIST';

export interface Application {
  id: number;
  programId: string;
  userId: string;
  motivation: string;
  status: ApplicationStatus;
}

export interface ExpertComment {
  expertId: string;
  expertName: string;
  comment: string;
  createdAt: string;
}
