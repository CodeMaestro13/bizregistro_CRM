import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FillerGraphComponent } from './filler-graph.component';

describe('FillerGraphComponent', () => {
  let component: FillerGraphComponent;
  let fixture: ComponentFixture<FillerGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FillerGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FillerGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
