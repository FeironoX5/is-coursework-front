export interface ProgramPreview {
  id: number;
  title: string;
  deadlineApply: string;
}

export interface Program {
  previewDto: ProgramPreview;

  description: string;
  goals: Record<string, any>;
  conditions: Record<string, any>;

  deadlineReview: string; // yyyy-MM-dd
  deadlineNotify: string; // yyyy-MM-dd

  durationDays: number;
  budgetQuota: number;
  peopleQuota: number;

  furtherActionsSentAt: string; // ISO datetime
  isPublished: boolean;

  createdAt: string; // ISO datetime
}
