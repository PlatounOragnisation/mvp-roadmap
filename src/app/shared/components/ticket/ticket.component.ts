import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
} from 'src/app/core/interfaces/ticket';
import { TicketEditDialogComponent } from './ticket-edit-dialog/ticket-edit-dialog.component';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],
})
export class TicketComponent implements OnInit {
  @Input() ticket!: Ticket;
  @Input() isEditorMode: boolean = false;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {}

  getPriorityClass(priority: TicketPriority | null | undefined): string {
    switch (priority) {
      case TicketPriority.Low:
        return 'low-priority';
      case TicketPriority.Medium:
        return 'medium-priority';
      case TicketPriority.High:
        return 'high-priority';
      default:
        return '';
    }
  }

  openEditDialog(): void {
    if (this.isEditorMode) {
      const dialogRef = this.dialog.open(TicketEditDialogComponent, {
        width: '520px',
        height: '542px',
        panelClass: 'custom-popup',
        data: { ticket: this.ticket },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          // handle any changes to the ticket here.
          // This could involve calling a service to update the ticket in your backend.
          this.ticket = result;
        }
      });
    }
  }
}
