import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregartemaPage } from './agregartema.page';

describe('AgregartemaPage', () => {
  let component: AgregartemaPage;
  let fixture: ComponentFixture<AgregartemaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregartemaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
