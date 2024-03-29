import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircleLoaderComponent } from './circle-loader.component';

describe('CircleLoaderComponent', () => {
  let component: CircleLoaderComponent;
  let fixture: ComponentFixture<CircleLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CircleLoaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircleLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
