import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { Ticket } from '../interfaces/ticket';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  constructor(private db: AngularFirestore) {}

  async createTicket(
    boardId: string,
    monthId: string,
    sprintId: string,
    ticket: Partial<Ticket>,
    position: number
  ): Promise<void> {
    if (!boardId || !monthId || !sprintId) {
      throw new Error('Required fields are missing');
    }

    const ticketRef = this.db
      .collection('boards')
      .doc(boardId)
      .collection('months')
      .doc(monthId)
      .collection('sprints')
      .doc(sprintId)
      .collection('tickets')
      .doc();

    await ticketRef.set({
      ...ticket,
      id: ticketRef.ref.id,
      position: position,
    });
  }

  async createDefaultTickets(boardId: string, monthId: string, sprintId: string): Promise<void> {
    const ticketNames = ['TBD', 'TBD', 'TBD'];
    const ticketPromises = ticketNames.map((title, i) => {
      const ticket = { title, description: '', boardId, monthId, sprintId };
      return this.createTicket(boardId, monthId, sprintId, ticket, i);
    });
    await Promise.all(ticketPromises);
  }

  getTickets(
    boardId: string,
    monthId: string,
    sprintId: string
  ): Observable<Ticket[]> {
    return this.db
      .collection('boards')
      .doc(boardId)
      .collection('months')
      .doc(monthId)
      .collection('sprints')
      .doc(sprintId)
      .collection<Ticket>('tickets')
      .valueChanges({ idField: 'id' });
  }

  async getTicketsPromise(
    boardId: string,
    monthId: string,
    sprintId: string
  ): Promise<Ticket[]> {
    const snapshot = await this.db
      .collection('boards')
      .doc(boardId)
      .collection('months')
      .doc(monthId)
      .collection('sprints')
      .doc(sprintId)
      .collection<Ticket>('tickets')
      .ref.get();

    return snapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as Ticket)
    );
  }

  async updateTicket(id: string, ticket: Partial<Ticket>): Promise<void> {
    if (!ticket.boardId || !ticket.monthId || !ticket.sprintId) {
      throw new Error('Required fields are missing');
    }

    const docRef = this.db
      .collection('boards')
      .doc(ticket.boardId)
      .collection('months')
      .doc(ticket.monthId)
      .collection('sprints')
      .doc(ticket.sprintId)
      .collection('tickets')
      .doc(id);

    await docRef.update({
      ...ticket,
      boardId: ticket.boardId,
      monthId: ticket.monthId,
      sprintId: ticket.sprintId,
    });
  }

  deleteTicket(
    ticketId: string,
    boardId: string,
    monthId: string,
    sprintId: string
  ): Promise<void> {
    return this.db
      .collection('boards')
      .doc(boardId)
      .collection('months')
      .doc(monthId)
      .collection('sprints')
      .doc(sprintId)
      .collection('tickets')
      .doc(ticketId)
      .delete();
  }

  public async getNewTicketPosition(
    boardId: string,
    monthId: string,
    sprintId: string
  ): Promise<number> {
    const tickets$: Observable<Ticket[]> = this.getTickets(
      boardId,
      monthId,
      sprintId
    );
    const tickets: Ticket[] = await firstValueFrom(tickets$);
    const positions = tickets.map((ticket) => ticket.position!);
    const maxPosition = positions.length ? Math.max(...positions) : 0;
    return maxPosition + 1;
  }
}
