// import { Component, inject, OnInit, signal } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { ProgramsService } from '../../../services/programs-service';
// import { Program } from '../../../models/program.model';
// import { MatCard, MatCardModule } from '@angular/material/card';
// import { MatChip } from '@angular/material/chips';
// import { MatButton } from '@angular/material/button';
// import { MatIcon } from '@angular/material/icon';
// import { DatePipe } from '@angular/common';
// import {
//   camelFormatter,
//   upperCaseFormatter,
// } from '../../../formatters';
//
// @Component({
//   selector: 'app-program-details-page',
//   imports: [MatCardModule, MatChip, MatButton, MatIcon, DatePipe],
//   templateUrl: './program-details-page.html',
//   styleUrl: './program-details-page.scss',
// })
// export class ProgramDetailsPage implements OnInit {
//   protected objectKeys = Object.keys;
//   private readonly programsService = inject(ProgramsService);
//   private readonly route = inject(ActivatedRoute);
//
//   protected readonly program = signal<Program | null>(null);
//
//   async ngOnInit() {
//     await this.load();
//   }
//
//   async load() {
//     const programId = this.route.snapshot.paramMap.get('id');
//
//     if (!programId) return;
//
//     const program = await this.programsService.getProgram(
//       Number(programId)
//     );
//     this.program.set(program);
//   }
//
//   protected openApplyPopup() {}
//
//   protected readonly camelFormatter = camelFormatter;
//   protected readonly upperCaseFormatter = upperCaseFormatter;
// }
