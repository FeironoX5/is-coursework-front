import {
  Component,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validator,
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
import { AsyncPipe } from '@angular/common';
import { Observable, Observer } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import {
  enumFormatter,
  roleFormatter,
  upperCaseFormatter,
} from '../../formatters';

type BaseFieldConfig = {
  propertyName: string;
  displayName: string;
  initialValue?: string;
  validators?: Validator[];
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

@Component({
  selector: 'app-dynamic-form',
  imports: [
    ReactiveFormsModule,
    MatSlideToggle,
    MatFormField,
    MatLabel,
    MatInput,
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
          fields.map((f) => [f.propertyName, f.initialValue ?? ''])
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

  public get values() {
    return this.form.value as Partial<T>;
  }

  protected readonly enumFormatter = enumFormatter;
  protected readonly roleFormatter = roleFormatter;
  protected readonly upperCaseFormatter = upperCaseFormatter;
}
