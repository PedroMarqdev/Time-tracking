import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {Employee} from '@models/employee.model';
import {TimeTrackingService} from '@services/time-tracking.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly STORAGE_KEY = 'employees';
  private employeesSubject = new BehaviorSubject<Employee[]>([]);

  constructor() {
    this.loadFromLocalStorage();
  }

  getEmployees(): Observable<Employee[]> {
    return this.employeesSubject.asObservable();
  }

  addEmployee(employee: Employee): boolean {
    const employees = this.employeesSubject.value;

    if (employees.some(e => e.id === employee.id)) {
      return false;
    }

    const updatedEmployees = [...employees, employee];
    this.saveToLocalStorage(updatedEmployees);
    return true;
  }

  employeeExists(id: number): boolean {
    const employees = this.employeesSubject.value;
    return employees.some(emp => emp.id === id);
  }

  updateEmployee(employee: Employee): boolean {
    const employees = this.employeesSubject.value;
    const index = employees.findIndex(e => e.id === employee.id);

    if (index === -1) {
      return false;
    }

    const updatedEmployees = [...employees];
    updatedEmployees[index] = employee;
    this.saveToLocalStorage(updatedEmployees);
    return true;
  }

  removeEmployee(id: number): void {
    const employees = this.employeesSubject.value;
    const filteredEmployees = employees.filter(e => e.id !== id);
    this.saveToLocalStorage(filteredEmployees);
  }

  private loadFromLocalStorage(): void {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const employees = data ? JSON.parse(data) : [
    ];
    this.employeesSubject.next(employees);
  }

  private saveToLocalStorage(employees: Employee[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(employees));
    this.employeesSubject.next(employees);
  }
}
