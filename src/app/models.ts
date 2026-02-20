// ============================================================
// models.ts — All API data models generated from OpenAPI spec
// ============================================================

// ─── Enums ───────────────────────────────────────────────────

export type UserRole =
  | 'ROLE_ARTIST'
  | 'ROLE_EXPERT'
  | 'ROLE_RESIDENCE_ADMIN'
  | 'ROLE_SUPERADMIN';

export type ApplicationStatus =
  | 'SENT'
  | 'REVIEWED'
  | 'APPROVED'
  | 'RESERVE'
  | 'REJECTED'
  | 'CONFIRMED'
  | 'DECLINED_BY_ARTIST';

export type ValidationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type NotificationCategory =
  | 'SYSTEM'
  | 'INVITE'
  | 'REVIEW'
  | 'STATUS';

export type MediaType = 'IMAGE' | 'VIDEO';

export type ArtDirection =
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

// ─── Pagination ──────────────────────────────────────────────

export interface PageMetadata {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface PageableObject {
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
  offset: number;
  sort: SortObject;
}

export interface SortObject {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

export interface Pageable {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface Page<T> {
  totalElements: number;
  totalPages: number;
  pageable: PageableObject;
  size: number;
  content: T[];
  number: number;
  sort: SortObject;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ─── HAL Links ───────────────────────────────────────────────

export interface HalLink {
  href: string;
  hreflang?: string;
  title?: string;
  type?: string;
  deprecation?: string;
  profile?: string;
  name?: string;
  templated?: boolean;
}

export type Links = Record<string, HalLink>;

// ─── User ────────────────────────────────────────────────────

export interface User {
  id?: number;
  username: string;
  name: string;
  surname: string;
  role: UserRole;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserDto {
  id?: number;
  username?: string;
  name?: string;
  surname?: string;
  role?: UserRole;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRequestBody {
  id?: number;
  username: string;
  name: string;
  surname: string;
  role: UserRole;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EntityModelUser extends Omit<User, 'id'> {
  _links?: Links;
}

export interface PagedModelEntityModelUser {
  _embedded?: { users: EntityModelUser[] };
  _links?: Links;
  page?: PageMetadata;
}

export interface PageUserDto extends Page<UserDto> {}

// ─── Auth ─────────────────────────────────────────────────────

export interface SignUpDto {
  /** min:3 max:255 */
  email: string;
  /** min:3 max:255 */
  name: string;
  /** min:3 max:255 */
  surname: string;
  /** min:8 max:128 */
  password: string;
  role: UserRole;
}

export interface SignInDto {
  /** min:3 max:255 */
  email: string;
  /** min:8 max:128 */
  password: string;
}

export interface AuthenticationDto {
  token?: string;
  user?: User;
}

// ─── Artist Profile ───────────────────────────────────────────

export interface ArtistProfileDto {
  userId?: number;
  email?: string;
  name?: string;
  surname?: string;
  biography?: string;
  location?: string;
}

export interface ArtistProfileCreateDto {
  /** max:500 */
  biography?: string;
  /** max:200 */
  location?: string;
}

export interface ArtistProfileUpdateDto {
  biography?: JsonNullableString;
  location?: JsonNullableString;
}

export interface EntityModelArtistProfile {
  biography?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
  _links?: Links;
}

export interface ArtistProfileRequestBody {
  id?: number;
  user?: string;
  biography?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PagedModelEntityModelArtistProfile {
  _embedded?: { artistProfiles: EntityModelArtistProfile[] };
  _links?: Links;
  page?: PageMetadata;
}

export interface PageArtistProfileDto extends Page<ArtistProfileDto> {}

// ─── Work ─────────────────────────────────────────────────────

export interface WorkDto {
  id?: number;
  title?: string;
  description?: string;
  artDirection?: ArtDirection;
  date?: string;
  link?: string;
}

export interface WorkCreateDto {
  /** max:255 */
  title: string;
  /** max:500 */
  description?: string;
  artDirection: ArtDirection;
  date: string;
  link?: string;
}

export interface WorkUpdateDto {
  title: JsonNullableString;
  description?: JsonNullableString;
  artDirection: JsonNullableArtDirectionEnum;
  date: JsonNullableLocalDate;
  link?: JsonNullableString;
}

export interface EntityModelWork {
  /** max:255 */
  title: string;
  description?: string;
  link?: string;
  artDirection: ArtDirection;
  date: string;
  createdAt?: string;
  updatedAt?: string;
  _links?: Links;
}

export interface WorkRequestBody {
  id?: number;
  artist: string;
  title: string;
  description?: string;
  link?: string;
  artDirection: ArtDirection;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PagedModelEntityModelWork {
  _embedded?: { works: EntityModelWork[] };
  _links?: Links;
  page?: PageMetadata;
}

export interface PageWorkDto extends Page<WorkDto> {}

// ─── Media ─────────────────────────────────────────────────────

export interface MediaDto {
  id?: number;
  uri?: string;
  mediaType?: MediaType;
  fileSize?: number;
}

export interface EntityModelMedia {
  uri: string;
  mediaType: MediaType;
  fileSize?: number;
  createdAt?: string;
  _links?: Links;
}

export interface MediaRequestBody {
  id?: number;
  work: string;
  uri: string;
  mediaType: MediaType;
  fileSize?: number;
  createdAt?: string;
}

export interface PagedModelEntityModelMedia {
  _embedded?: { medias: EntityModelMedia[] };
  _links?: Links;
  page?: PageMetadata;
}

export interface PageMediaDto extends Page<MediaDto> {}

// ─── Achievement ──────────────────────────────────────────────

export interface AchievementDto {
  id?: number;
  type?: AchievementType;
  title?: string;
  description?: string;
  link?: string;
}

export interface AchievementCreateDto {
  type: AchievementType;
  /** min:1 max:255 */
  title: string;
  /** max:500 */
  description?: string;
  link?: string;
}

export interface AchievementUpdateDto {
  title: JsonNullableString;
  description?: JsonNullableString;
  link?: JsonNullableString;
}

export interface EntityModelAchievement {
  /** min:1 max:255 */
  title: string;
  /** max:500 */
  description?: string;
  link?: string;
  type: AchievementType;
  createdAt?: string;
  updatedAt?: string;
  _links?: Links;
}

export interface AchievementRequestBody {
  id?: number;
  artist: string;
  title: string;
  description?: string;
  link?: string;
  type: AchievementType;
  createdAt?: string;
  updatedAt?: string;
}

export interface PagedModelEntityModelAchievement {
  _embedded?: { achievements: EntityModelAchievement[] };
  _links?: Links;
  page?: PageMetadata;
}

export interface PageAchievementDto extends Page<AchievementDto> {}

// ─── Residence ────────────────────────────────────────────────

export interface ValidationResponseDto {
  validationStatus?: ValidationStatus;
  validationComment?: string;
  validationSubmittedAt?: string;
}

export interface ResidenceDetailsDto {
  id?: number;
  userId?: number;
  title?: string;
  description?: string;
  location?: string;
  contacts?: Record<string, unknown>;
  isPublished?: boolean;
  validation?: ValidationResponseDto;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResidenceDetailsCreateDto {
  /** max:255 */
  title: string;
  /** max:5000 */
  description?: string;
  /** max:255 */
  location: string;
  contacts: Record<string, unknown>;
}

export interface ResidenceDetailsUpdateDto {
  title: JsonNullableString;
  description?: JsonNullableString;
  location: JsonNullableString;
  contacts: JsonNullableMapStringObject;
}

export interface ResidenceDetailsRequestBody {
  id?: number;
  user?: string;
  title?: string;
  description?: string;
  contacts?: Record<string, unknown>;
  location?: string;
  isPublished?: boolean;
  validationStatus: ValidationStatus;
  validationComment?: string;
  validationSubmittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EntityModelResidenceDetails {
  title?: string;
  description?: string;
  contacts?: Record<string, unknown>;
  location?: string;
  isPublished?: boolean;
  validationStatus: ValidationStatus;
  validationComment?: string;
  validationSubmittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  _links?: Links;
}

export interface PagedModelEntityModelResidenceDetails {
  _embedded?: { residenceDetailses: EntityModelResidenceDetails[] };
  _links?: Links;
  page?: PageMetadata;
}

export interface PageResidenceDetailsDto extends Page<ResidenceDetailsDto> {}

// ─── Residence Stats ──────────────────────────────────────────

export interface ResidenceStatsDto {
  viewsCount?: number;
}

export interface EntityModelResidenceStats {
  viewsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  _links?: Links;
}

export interface ResidenceStatsRequestBody {
  id?: number;
  residence?: string;
  viewsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PagedModelEntityModelResidenceStats {
  _embedded?: { residenceStatses: EntityModelResidenceStats[] };
  _links?: Links;
  page?: PageMetadata;
}

// ─── Program ──────────────────────────────────────────────────

export interface ProgramPreviewDto {
  id?: number;
  residenceId?: number;
  title?: string;
  deadlineApply?: string;
}

export interface ProgramDto {
  previewDto?: ProgramPreviewDto;
  description?: string;
  goals?: Record<string, unknown>;
  conditions?: Record<string, unknown>;
  deadlineReview?: string;
  deadlineNotify?: string;
  durationDays?: number;
  budgetQuota?: number;
  peopleQuota?: number;
  furtherActionsSentAt?: string;
  isPublished?: boolean;
  createdAt?: string;
}

export interface ProgramCreateDto {
  /** max:255 */
  title: string;
  /** max:5000 */
  description?: string;
  goals?: Record<string, unknown>;
  conditions?: Record<string, unknown>;
  deadlineApply: string;
  deadlineReview: string;
  deadlineNotify: string;
  durationDays?: number;
  budgetQuota?: number;
  peopleQuota?: number;
}

export interface ProgramUpdateDto {
  title: JsonNullableString;
  description?: JsonNullableString;
  goals?: JsonNullableMapStringObject;
  conditions?: JsonNullableMapStringObject;
  deadlineApply: JsonNullableLocalDate;
  deadlineReview: JsonNullableLocalDate;
  deadlineNotify: JsonNullableLocalDate;
  durationDays?: JsonNullableInteger;
  budgetQuota?: JsonNullableInteger;
  peopleQuota?: JsonNullableInteger;
  isPublished?: JsonNullableBoolean;
}

export interface ProgramRequestBody {
  id?: number;
  residence: string;
  title: string;
  description?: string;
  goals?: Record<string, unknown>;
  conditions?: Record<string, unknown>;
  deadlineApply: string;
  deadlineReview: string;
  deadlineNotify: string;
  durationDays?: number;
  budgetQuota?: number;
  peopleQuota?: number;
  furtherActionsSentAt?: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EntityModelProgram {
  title: string;
  description?: string;
  goals?: Record<string, unknown>;
  conditions?: Record<string, unknown>;
  deadlineApply: string;
  deadlineReview: string;
  deadlineNotify: string;
  /** min:0 max:360 */
  durationDays?: number;
  /** min:0 max:10000000 */
  budgetQuota?: number;
  /** min:0 max:1000 */
  peopleQuota?: number;
  furtherActionsSentAt?: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
  _links?: Links;
}

export interface PagedModelEntityModelProgram {
  _embedded?: { programs: EntityModelProgram[] };
  _links?: Links;
  page?: PageMetadata;
}

export interface CollectionModelEntityModelProgram {
  _embedded?: { programs: EntityModelProgram[] };
  _links?: Links;
}

export interface PageProgramPreviewDto extends Page<ProgramPreviewDto> {}

// ─── Program Stats ─────────────────────────────────────────────

export interface ProgramStatsDto {
  viewsCount?: number;
  applicationsCount?: number;
  confirmedCount?: number;
  declinedCount?: number;
}

export interface EntityModelProgramStats {
  viewsCount?: number;
  applicationsCount?: number;
  confirmedCount?: number;
  declinedCount?: number;
  createdAt?: string;
  updatedAt?: string;
  _links?: Links;
}

export interface ProgramStatsRequestBody {
  id?: number;
  program?: string;
  viewsCount?: number;
  applicationsCount?: number;
  confirmedCount?: number;
  declinedCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PagedModelEntityModelProgramStats {
  _embedded?: { programStatses: EntityModelProgramStats[] };
  _links?: Links;
  page?: PageMetadata;
}

// ─── Application ──────────────────────────────────────────────

export interface ApplicationDto {
  id?: number;
  programId?: number;
  userId?: number;
  motivation?: string;
  status?: ApplicationStatus;
}

export interface ApplicationCreateDto {
  motivation: string;
}

export interface ApplicationRequestBody {
  id?: number;
  program: string;
  artist?: string;
  motivation?: string;
  status: ApplicationStatus;
  submittedAt?: string;
  createdAt?: string;
}

export interface EntityModelApplication {
  motivation?: string;
  status: ApplicationStatus;
  submittedAt?: string;
  createdAt?: string;
  _links?: Links;
}

export interface PagedModelEntityModelApplication {
  _embedded?: { applications: EntityModelApplication[] };
  _links?: Links;
  page?: PageMetadata;
}

export interface PageApplicationDto extends Page<ApplicationDto> {}

export interface SendFurtherActionsDto {
  message: string;
  link?: string;
}

// ─── Application Evaluation ───────────────────────────────────

export interface ApplicationEvaluationDto {
  expertEmail?: string;
  score?: number;
  comment?: string;
}

export interface ApplicationEvaluationCreateDto {
  /** min:0 max:100 */
  score: number;
  comment: string;
}

export interface ApplicationEvaluationRequestBody {
  id?: number;
  application: string;
  expert?: string;
  /** min:0 max:100 */
  score?: number;
  comment?: string;
  createdAt?: string;
}

export interface EntityModelApplicationEvaluation {
  /** min:0 max:100 */
  score?: number;
  comment?: string;
  createdAt?: string;
  _links?: Links;
}

export interface PagedModelEntityModelApplicationEvaluation {
  _embedded?: {
    applicationEvaluations: EntityModelApplicationEvaluation[];
  };
  _links?: Links;
  page?: PageMetadata;
}

export interface PageApplicationEvaluationDto extends Page<ApplicationEvaluationDto> {}

// ─── Review ───────────────────────────────────────────────────

export interface ReviewDto {
  id?: number;
  artistName?: string;
  score?: number;
  comment?: string;
  createdAt?: string;
}

export interface ReviewCreateDto {
  /** min:1 max:10 */
  score: number;
  /** max:1000 */
  comment?: string;
}

export interface ReviewUpdateDto {
  /** min:1 max:10 */
  score?: number;
  /** max:1000 */
  comment?: string;
}

export interface ReviewRequestBody {
  id?: number;
  program: string;
  artist: string;
  /** min:1 max:10 */
  score: number;
  /** max:1000 */
  comment?: string;
  createdAt: string;
}

export interface EntityModelReview {
  /** min:1 max:10 */
  score: number;
  /** max:1000 */
  comment?: string;
  createdAt: string;
  _links?: Links;
}

export interface PagedModelEntityModelReview {
  _embedded?: { reviews: EntityModelReview[] };
  _links?: Links;
  page?: PageMetadata;
}

export interface PageReviewDto extends Page<ReviewDto> {}

// ─── Notification ─────────────────────────────────────────────

export interface NotificationDto {
  id?: number;
  message?: string;
  link?: string;
  category?: NotificationCategory;
  readAt?: string;
  createdAt?: string;
}

export interface NotificationCreateDto {
  email: string;
  message: string;
  category: NotificationCategory;
  link?: string;
}

export interface NotificationRequestBody {
  id?: number;
  user?: string;
  message: string;
  link?: string;
  category: NotificationCategory;
  readAt?: string;
  createdAt?: string;
}

export interface EntityModelNotification {
  message: string;
  link?: string;
  category: NotificationCategory;
  readAt?: string;
  createdAt?: string;
  _links?: Links;
}

export interface PagedModelEntityModelNotification {
  _embedded?: { notifications: EntityModelNotification[] };
  _links?: Links;
  page?: PageMetadata;
}

export interface PageNotificationDto extends Page<NotificationDto> {}

// ─── Expert ───────────────────────────────────────────────────

export interface ExpertDto {
  userId?: number;
  email?: string;
  name?: string;
  surname?: string;
}

export interface PageExpertDto extends Page<ExpertDto> {}

// ─── Admin / Validation ───────────────────────────────────────

export interface ValidationActionDto {
  comment?: string;
}

// ─── JSON Nullable helpers (JsonNullable<T>) ──────────────────
// These wrap optional patch fields — when `present: true` the value is applied.

export interface JsonNullableString {
  present?: boolean;
  value?: string | null;
}

export interface JsonNullableBoolean {
  present?: boolean;
  value?: boolean | null;
}

export interface JsonNullableInteger {
  present?: boolean;
  value?: number | null;
}

export interface JsonNullableLocalDate {
  present?: boolean;
  value?: string | null;
}

export interface JsonNullableArtDirectionEnum {
  present?: boolean;
  value?: ArtDirection | null;
}

export interface JsonNullableMapStringObject {
  present?: boolean;
  value?: Record<string, unknown> | null;
}

// ─── Misc ─────────────────────────────────────────────────────

export interface CollectionModelObject {
  _embedded?: { objects: unknown[] };
  _links?: Links;
}
