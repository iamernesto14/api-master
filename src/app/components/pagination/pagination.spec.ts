import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from './pagination';
import { By } from '@angular/platform-browser';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, PaginationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    component.currentPage = 1;
    component.pageSize = 10;
    component.totalItems = 50;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate correct pages array', () => {
    component.currentPage = 3;
    fixture.detectChanges();
    expect(component.pages).toEqual([1, 2, 3, 4, 5]);

    component.currentPage = 1;
    fixture.detectChanges();
    expect(component.pages).toEqual([1, 2, 3, 4, 5]);

    component.currentPage = 5;
    fixture.detectChanges();
    expect(component.pages).toEqual([1, 2, 3, 4, 5]);

    component.totalItems = 100;
    component.currentPage = 7;
    fixture.detectChanges();
    expect(component.pages).toEqual([5, 6, 7, 8, 9]);
  });


  it('should emit pageChange for previousPage and nextPage', () => {
    spyOn(component.pageChange, 'emit');
    component.currentPage = 2;
    component.previousPage();
    expect(component.pageChange.emit).toHaveBeenCalledWith(1);

    component.nextPage();
    expect(component.pageChange.emit).toHaveBeenCalledWith(3);

    component.currentPage = 1;
    component.previousPage();
    expect(component.pageChange.emit).not.toHaveBeenCalledWith(0);

    component.currentPage = 5;
    component.nextPage();
    expect(component.pageChange.emit).not.toHaveBeenCalledWith(6);
  });
});