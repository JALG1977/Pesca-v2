import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarimagenPage } from './agregarimagen.page';

describe('AgregarimagenPage', () => {
  let component: AgregarimagenPage;
  let fixture: ComponentFixture<AgregarimagenPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarimagenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
