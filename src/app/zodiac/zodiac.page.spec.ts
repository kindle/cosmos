import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ZodiacPage } from './zodiac.page';

describe('ZodiacPage', () => {
  let component: ZodiacPage;
  let fixture: ComponentFixture<ZodiacPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ZodiacPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
