import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketEditDialogComponent } from './ticket-edit-dialog.component';

describe('TicketEditDialogComponent', () => {
  let component: TicketEditDialogComponent;
  let fixture: ComponentFixture<TicketEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketEditDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
