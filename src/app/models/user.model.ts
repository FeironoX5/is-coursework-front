import { FieldConfig } from '../components/dynamic-form/dynamic-form';
import {
  enumFormatter,
  roleFormatter,
  upperCaseFormatter,
} from '../formatters';

export type UserRole =
  | 'ROLE_ARTIST'
  | 'ROLE_EXPERT'
  | 'ROLE_RESIDENCE_ADMIN'
  | 'ROLE_SUPERADMIN';

export type AuthCredentials = {
  email: string;
  password: string;
};

export type BaseUserProfile = {
  username: string;
  name: string;
  surname: string;
  role: UserRole;
  is_active: boolean;
};

type GeneratedProps = 'is_active' | 'username';

export type RegisterCredentials = Omit<
  AuthCredentials & BaseUserProfile,
  GeneratedProps
>;

export const SignInFormConfig: FieldConfig[] = [
  {
    type: 'input',
    propertyName: 'email',
    displayName: 'Email',
    dataType: 'email',
  },
  {
    type: 'input',
    propertyName: 'password',
    displayName: 'Password',
    dataType: 'password',
  },
];

export const SignUpFormConfig: FieldConfig[] = [
  {
    type: 'input',
    propertyName: 'name',
    displayName: 'Name',
    dataType: 'text',
  },
  {
    type: 'input',
    propertyName: 'surname',
    displayName: 'Surname',
    dataType: 'text',
  },
  {
    type: 'selectable',
    propertyName: 'role',
    displayName: 'Role',
    options: ['ROLE_ARTIST', 'ROLE_EXPERT', 'ROLE_RESIDENCE_ADMIN'],
    formatter: (s: string): string =>
      upperCaseFormatter(enumFormatter(roleFormatter(s))),
  },
  {
    type: 'input',
    propertyName: 'email',
    displayName: 'Email',
    dataType: 'email',
  },
  {
    type: 'input',
    propertyName: 'password',
    displayName: 'Password',
    dataType: 'password',
  },
];

// type ArtistExtras = {
//   biography: string;
//   location: string;
// };
//
// type ResidenceExtras = {
//   title: string;
//   description: string;
//   location: string;
//   isPublished: boolean;
// };
//
// type RoleExtras = {
//   ROLE_ARTIST: ArtistExtras;
//   ROLE_EXPERT: {};
//   ROLE_RESIDENCE_ADMIN: ResidenceExtras;
//   ROLE_SUPERADMIN: {};
// };

//
// export class ExpertProfile extends WithFormConfig {
//   constructor(public readonly data: ProfileByRole<'ROLE_EXPERT'>) {
//     super();
//   }
//
//   static override asFormConfig(): FieldConfig[] {
//     return [
//       {
//         type: 'input',
//         propertyName: 'name',
//         displayName: 'Name',
//         dataType: 'text',
//       },
//       {
//         type: 'input',
//         propertyName: 'surname',
//         displayName: 'Surname',
//         dataType: 'text',
//       },
//       {
//         type: 'input',
//         propertyName: 'email',
//         displayName: 'Email',
//         dataType: 'email',
//       },
//     ];
//   }
// }
//
// export class ResidenceProfile extends WithFormConfig {
//   constructor(
//     public readonly data: ProfileByRole<'ROLE_RESIDENCE_ADMIN'>
//   ) {
//     super();
//   }
//
//   static override asFormConfig(): FieldConfig[] {
//     return [
//       {
//         type: 'input',
//         propertyName: 'title',
//         displayName: 'Title',
//         dataType: 'text',
//       },
//       {
//         type: 'input',
//         propertyName: 'description',
//         displayName: 'Description',
//         dataType: 'text',
//       },
//       {
//         type: 'input',
//         propertyName: 'location',
//         displayName: 'Location',
//         dataType: 'text',
//       },
//       {
//         type: 'input',
//         propertyName: 'email',
//         displayName: 'Email',
//         dataType: 'email',
//       },
//     ];
//   }
// }
