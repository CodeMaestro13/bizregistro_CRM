import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadActivityChartComponent } from './lead-activity-chart.component';

describe('LeadActivityChartComponent', () => {
  let component: LeadActivityChartComponent;
  let fixture: ComponentFixture<LeadActivityChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadActivityChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadActivityChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
