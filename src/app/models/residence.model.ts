export type ValidationStatus = 'pending' | 'approved' | 'rejected';

export interface Residence {
  id: string;
  name: string;
  description: string;
  location: string;
  contactInfo: string;
  validationStatus: ValidationStatus;
  validationComment?: string;
}
