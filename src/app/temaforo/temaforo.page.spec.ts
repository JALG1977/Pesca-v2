import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemaforoPage } from './temaforo.page';

describe('TemaforoPage', () => {
  let component: TemaforoPage;
  let fixture: ComponentFixture<TemaforoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TemaforoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
