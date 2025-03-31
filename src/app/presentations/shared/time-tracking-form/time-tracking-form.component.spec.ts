import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeTrackingFormComponent } from './time-tracking-form.component';

describe('TimeTrackingFormComponent', () => {
  let component: TimeTrackingFormComponent;
  let fixture: ComponentFixture<TimeTrackingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeTrackingFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeTrackingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
