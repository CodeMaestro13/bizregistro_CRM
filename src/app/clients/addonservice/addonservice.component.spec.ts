import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddonserviceComponent } from './addonservice.component';

describe('AddonserviceComponent', () => {
  let component: AddonserviceComponent;
  let fixture: ComponentFixture<AddonserviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddonserviceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddonserviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
