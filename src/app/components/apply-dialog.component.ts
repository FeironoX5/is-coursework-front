import { Component, inject, viewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DynamicForm, FieldConfig } from './dynamic-form.component';
import type { ApplicationCreateDto, ProgramDto } from '../models';

@Component({
  selector: 'app-apply-dialog',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, DynamicForm],
  template: `
    <mat-card class="apply-dialog">
      <mat-card-header>
        <mat-card-title>
          Apply for {{ data.program.previewDto?.title }}
        </mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <app-dynamic-form #applyForm [formConfig]="data.fields" />
      </mat-card-content>

      <mat-card-actions align="end">
        <button mat-flat-button color="primary" (click)="submit()">
          Submit
        </button>
        <button mat-button (click)="dialogRef.close()">Cancel</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
      .apply-dialog {
        width: 100%;
        max-width: 600px;
        padding: 15px;
      }
      mat-card-content {
        padding-top: 20px;
      }
    `,
  ],
})
export class ApplyDialogComponent {
  readonly dialogRef =
    inject<MatDialogRef<ApplyDialogComponent>>(MatDialogRef);

  readonly data = inject<{
    program: ProgramDto;
    fields: FieldConfig[];
  }>(MAT_DIALOG_DATA);

  protected readonly applyForm =
    viewChild<DynamicForm<ApplicationCreateDto>>('applyForm');

  submit() {
    const form = this.applyForm();
    if (!form?.valid) {
      form?.markAllTouched();
      return;
    }
    this.dialogRef.close(form.values);
  }
}
