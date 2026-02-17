// ============================================================
// dynamic-form.component.ts
// ============================================================

import {
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
} from '@angular/material/input';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSelect } from '@angular/material/select';
import {
  enumFormatter,
  roleFormatter,
  upperCaseFormatter,
} from '../formatters';

// ─── Field config types ───────────────────────────────────────

type BaseFieldConfig = {
  propertyName: string;
  displayName: string;
  initialValue?: string;
  validators?: any[];
};

type InputFieldConfig = BaseFieldConfig & {
  type: 'input';
  dataType: 'text' | 'number' | 'date' | 'email' | 'password';
};

type BooleanFieldConfig = BaseFieldConfig & {
  type: 'boolean';
};

type SelectableFieldConfig = BaseFieldConfig & {
  type: 'selectable';
  options: string[];
  formatter?: (s: string) => string;
};

type AutocompleteFieldConfig = BaseFieldConfig & {
  type: 'autocomplete';
  loader: Promise<string[]>;
};

export type FieldConfig =
  | InputFieldConfig
  | BooleanFieldConfig
  | SelectableFieldConfig
  | AutocompleteFieldConfig;

// ─── Component ────────────────────────────────────────────────

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatSlideToggle,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatProgressBar,
    MatOption,
    MatSelect,
  ],
  templateUrl: './dynamic-form.html',
  styleUrl: './dynamic-form.scss',
})
export class DynamicForm<T> {
  public readonly formConfig = input.required<FieldConfig[]>();

  private readonly formBuilder = inject(FormBuilder);

  protected form = this.formBuilder.group({});
  protected autocompleteLoading = signal<boolean>(false);
  protected autocompleteOptions = signal<string[]>([]);

  constructor() {
    effect(() => {
      const fields = this.formConfig();
      this.form = this.formBuilder.group(
        Object.fromEntries(
          fields.map((f) => {
            const validators = f.validators ?? [];
            return [
              f.propertyName,
              [f.initialValue ?? '', ...validators],
            ];
          })
        )
      );
    });
  }

  loadAutocompleteOptions(field: AutocompleteFieldConfig) {
    this.autocompleteLoading.set(true);
    field.loader
      .then((v) => this.autocompleteOptions.set(v))
      .finally(() => this.autocompleteLoading.set(false));
  }

  public get valid() {
    return this.form.valid;
  }

  public get values(): Partial<T> {
    return this.form.value as Partial<T>;
  }

  public markAllTouched(): void {
    this.form.markAllAsTouched();
  }

  protected readonly enumFormatter = enumFormatter;
  protected readonly roleFormatter = roleFormatter;
  protected readonly upperCaseFormatter = upperCaseFormatter;
}
