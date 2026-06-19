import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkProcessFormComponent } from './work-process-form.component';

describe('WorkProcessFormComponent', () => {
  let component: WorkProcessFormComponent;
  let fixture: ComponentFixture<WorkProcessFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkProcessFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkProcessFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
