import { Component, inject, OnInit, signal } from '@angular/core';
import { ApplicationService } from '../../../services/application-service';
import { Application } from '../../../models/application.model';
import { MatList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatChip } from '@angular/material/chips';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';

@Component({
  selector: 'app-my-applications-page',
  imports: [
    MatList,
    MatListItem,
    MatIcon,
    MatChip,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatCardHeader,
  ],
  templateUrl: './my-applications-page.html',
  styleUrl: './my-applications-page.scss',
})
export class MyApplicationsPage implements OnInit {
  private readonly applicationService = inject(ApplicationService);

  protected readonly applications = signal<Application[]>([]);

  async ngOnInit() {
    await this.load();
  }

  async load() {
    const applications =
      await this.applicationService.getMyApplications();
    this.applications.set(applications);
  }
}
