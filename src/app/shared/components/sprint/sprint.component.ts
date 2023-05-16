import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sprint } from 'src/app/core/interfaces/sprint';
import { Ticket } from 'src/app/core/interfaces/ticket';
import { SprintService } from 'src/app/core/services/sprint.service';
import { TicketService } from 'src/app/core/services/ticket.service';
import { TicketCreationDialogComponent } from '../ticket/ticket-creation-dialog/ticket-creation-dialog.component';
import { Subscription } from 'rxjs';

import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-sprint',
  templateUrl: './sprint.component.html',
  styleUrls: ['./sprint.component.scss'],
})
export class SprintComponent implements OnInit, OnDestroy {
  @Input() boardId!: string;
  @Input() sprint!: Sprint;
  @Input() monthId?: string;
  @Input() isEditorMode: boolean = false;

  tickets: Ticket[] = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private dialog: MatDialog,
    private sprintService: SprintService,
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {
    if (this.sprint.boardId && this.sprint.id && this.monthId) {
      this.fetchTickets();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  fetchTickets(): void {
    const ticketsSub = this.ticketService
      .getTickets(this.sprint.boardId!, this.monthId!, this.sprint.id!)
      .subscribe((tickets: Ticket[]) => {
        this.tickets = tickets.sort(
          (a, b) => (a.position ?? 0) - (b.position ?? 0)
        );
      });

    this.subscriptions.add(ticketsSub);
  }

  openTicketCreationDialog(): void {
    if (
      this.isEditorMode &&
      this.sprint.boardId &&
      this.sprint.id &&
      this.monthId
    ) {
      this.dialog.open(TicketCreationDialogComponent, {
        width: '400px',
        data: {
          boardId: this.sprint.boardId,
          sprintId: this.sprint.id,
          monthId: this.monthId,
        },
      });
    }
  }

  async drop(
    event: CdkDragDrop<{ tickets: Ticket[]; monthId: string | undefined }>
  ): Promise<void> {
    if (this.isEditorMode) {
      if (event.previousContainer === event.container) {
        // Moving the item within the same list
        moveItemInArray(
          event.container.data.tickets,
          event.previousIndex,
          event.currentIndex
        );
        // Update positions for the list
        if (this.monthId) {
          this.updateTicketOrder(
            event.container.data.tickets,
            this.sprint.id!,
            this.monthId
          );
        }
      } else {
        // Moving the item to another list
        transferArrayItem(
          event.previousContainer.data.tickets,
          event.container.data.tickets,
          event.previousIndex,
          event.currentIndex
        );
        // Check if monthId is defined
        if (
          this.monthId &&
          event.previousContainer.data.monthId &&
          event.container.data.monthId
        ) {
          // Delete the old ticket
          await this.ticketService.deleteTicket(
            event.item.data.id!,
            this.boardId,
            event.previousContainer.data.monthId,
            event.previousContainer.id
          );
          // Create new ticket
          const newTicket: Partial<Ticket> = {
            ...event.item.data,
            position: event.currentIndex,
          };
          await this.ticketService.createTicket(
            this.boardId,
            event.container.data.monthId,
            event.container.id,
            newTicket,
            event.currentIndex
          );
          // Update positions for both source and target lists
          this.updateTicketOrder(
            event.previousContainer.data.tickets,
            event.previousContainer.id,
            event.previousContainer.data.monthId
          );
          this.updateTicketOrder(
            event.container.data.tickets,
            this.sprint.id!,
            this.monthId
          );
        }
      }
    }
  }

  private async updateTicketOrder(
    tickets: Ticket[],
    sprintId: string,
    monthId: string
  ): Promise<void> {
    tickets.forEach(async (ticket, index) => {
      const updatedTicket = {
        ...ticket,
        position: index,
      };
      await this.ticketService.updateTicket(updatedTicket.id!, {
        ...updatedTicket,
        boardId: this.boardId,
        sprintId: sprintId,
        monthId: monthId,
      });
    });
  }
}
