// import { Component, computed, inject, signal } from '@angular/core';
// import { ResidenceService } from '../../../services/residence-service';
// import {
//   MatCard,
//   MatCardContent,
//   MatCardHeader,
//   MatCardTitle,
// } from '@angular/material/card';
// import { MatChip } from '@angular/material/chips';
// import { MatButton } from '@angular/material/button';
// import {
//   DynamicForm,
//   FieldConfig,
// } from '../../../components/dynamic-form/dynamic-form';
// import { MatIcon } from '@angular/material/icon';
// import { Residence } from '../../../models/residence.model';
//
// @Component({
//   selector: 'app-expert-profile-page',
//   imports: [
//     MatCard,
//     MatCardHeader,
//     MatCardTitle,
//     MatChip,
//     MatCardContent,
//     MatButton,
//     DynamicForm,
//     MatIcon,
//   ],
//   templateUrl: './expert-profile-page.html',
//   styleUrl: './expert-profile-page.scss',
// })
// export class ExpertProfilePage {
//   private readonly residenceService = inject(ResidenceService);
//
//   protected readonly residence = signal<Residence | null>(null);
//   protected readonly loading = signal(false);
//
//   protected readonly canPublish = computed(() => {
//     const res = this.residence();
//     return res?.validationStatus === 'approved';
//   });
//
//   protected readonly profileFields: FieldConfig[] = [
//     {
//       type: 'input',
//       dataType: 'text',
//       propertyName: 'name',
//       displayName: 'Наименование',
//     },
//     {
//       type: 'input',
//       dataType: 'text',
//       propertyName: 'description',
//       displayName: 'Описание',
//     },
//     {
//       type: 'input',
//       dataType: 'text',
//       propertyName: 'location',
//       displayName: 'Местоположение',
//     },
//     {
//       type: 'input',
//       dataType: 'text',
//       propertyName: 'contactInfo',
//       displayName: 'Контактные данные',
//     },
//   ];
//
//   async ngOnInit() {
//     await this.loadProfile();
//   }
//
//   async loadProfile() {
//     this.loading.set(true);
//     try {
//       const profile = await this.residenceService.getMyResidence();
//       this.residence.set(profile);
//     } catch {
//       // Резиденция еще не создана
//       this.residence.set(null);
//     } finally {
//       this.loading.set(false);
//     }
//   }
//
//   async saveProfile(form: DynamicForm<any>) {
//     if (!form.valid) return;
//
//     this.loading.set(true);
//     try {
//       const data = form.values;
//       const isNew = !this.residence();
//
//       if (isNew) {
//         await this.residenceService.createResidence(data);
//       } else {
//         await this.residenceService.updateMyResidence(data);
//       }
//
//       await this.loadProfile();
//     } finally {
//       this.loading.set(false);
//     }
//   }
//
//   async resubmitValidation() {
//     if (!confirm('Отправить резиденцию на повторную проверку?'))
//       return;
//
//     this.loading.set(true);
//     try {
//       await this.residenceService.resubmitValidation();
//       await this.loadProfile();
//     } finally {
//       this.loading.set(false);
//     }
//   }
//
//   getStatusLabel(status: string): string {
//     const labels: Record<string, string> = {
//       pending: 'На рассмотрении',
//       approved: 'Одобрено',
//       rejected: 'Отклонено',
//     };
//     return labels[status] || status;
//   }
//
//   getStatusColor(status: string): string {
//     const colors: Record<string, string> = {
//       pending: 'accent',
//       approved: 'primary',
//       rejected: 'warn',
//     };
//     return colors[status] || '';
//   }
// }
