import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkStatusComponent } from './work-status.component';

describe('WorkStatusComponent', () => {
  let component: WorkStatusComponent;
  let fixture: ComponentFixture<WorkStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
