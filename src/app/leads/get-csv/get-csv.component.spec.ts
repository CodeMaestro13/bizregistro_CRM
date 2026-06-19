import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetCsvComponent } from './get-csv.component';

describe('GetCsvComponent', () => {
  let component: GetCsvComponent;
  let fixture: ComponentFixture<GetCsvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetCsvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
