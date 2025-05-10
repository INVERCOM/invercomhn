import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LotesViewGeneralComponent } from './lotes-view-general.component';

describe('LotesViewGeneralComponent', () => {
  let component: LotesViewGeneralComponent;
  let fixture: ComponentFixture<LotesViewGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LotesViewGeneralComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LotesViewGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
