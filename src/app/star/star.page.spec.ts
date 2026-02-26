import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StarPage } from './star.page';

describe('StarPage', () => {
  let component: StarPage;
  let fixture: ComponentFixture<StarPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(StarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
