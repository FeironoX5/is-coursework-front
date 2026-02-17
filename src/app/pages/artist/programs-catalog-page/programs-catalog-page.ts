import { Component, inject, OnInit, signal } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ProgramsService } from '../../../services/programs-service';
import { Router, RouterLink } from '@angular/router';
import {
  Program,
  ProgramPreview,
} from '../../../models/program.model';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { MatChip } from '@angular/material/chips';

@Component({
  selector: 'app-programs-catalog-page',
  imports: [
    MatPaginator,
    RouterLink,
    MatCardModule,
    DatePipe,
    MatChip,
  ],
  templateUrl: './programs-catalog-page.html',
  styleUrl: './programs-catalog-page.scss',
})
export class ProgramsCatalogPage implements OnInit {
  private readonly programService = inject(ProgramsService);
  private readonly router = inject(Router);

  protected readonly programs = signal<ProgramPreview[]>([]);
  protected readonly totalElements = signal(0);
  protected readonly pageSize = signal(20);
  protected readonly pageIndex = signal(0);
  protected readonly loading = signal(false);

  async ngOnInit() {
    await this.loadPrograms();
  }

  async loadPrograms() {
    this.loading.set(true);
    try {
      const result = await this.programService.getPrograms(
        this.pageIndex(),
        this.pageSize()
      );
      this.programs.set(result.content);
      this.totalElements.set(result.totalElements);
    } finally {
      this.loading.set(false);
    }
  }

  async onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    await this.loadPrograms();
  }

  viewProgramDetails(programId: string) {
    this.router.navigate(['/artist/programs', programId]);
  }
}
