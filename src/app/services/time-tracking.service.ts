import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TimeTracking } from '@models/time-tracking.model';
import { EmployeeService } from './employee.service';
import {formatBrazilianDate} from '../utils/DateUtils';

@Injectable({
  providedIn: 'root'
})
export class TimeTrackingService {
  private readonly STORAGE_KEY = 'time_tracking_records';
  private timeTrackingRecords = new BehaviorSubject<TimeTracking[]>([]);

  constructor(private employeeService: EmployeeService) {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      const parsedData: TimeTracking[] = JSON.parse(data, (key, value) => {
        if (key === 'startTime' || key === 'endTime' || key === 'date') {
          return value ? formatBrazilianDate(new Date(value)) : null;
        }
        return value;
      });
      this.timeTrackingRecords.next(parsedData);
    } else {
      this.timeTrackingRecords.next([]);
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.timeTrackingRecords.value));
  }

  getTimeTrackingRecords(): Observable<TimeTracking[]> {
    return this.timeTrackingRecords.asObservable();
  }

  getEmployeeTimeTrackingRecords(employeeId: number): Observable<TimeTracking[]> {
    return new Observable<TimeTracking[]>(observer => {
      this.timeTrackingRecords.subscribe(records => {
        observer.next(records.filter(r => r.employeeId === employeeId));
      });
    });
  }

  deleteEmployeeRecords(employeeId: number): void {
    const records = this.timeTrackingRecords.value;
    const filteredRecords = records.filter(r => r.employeeId !== employeeId);
    this.timeTrackingRecords.next(filteredRecords);
    this.saveToLocalStorage();
  }

  checkInEmployee(employeeId: number): boolean {
    if (!this.employeeService.employeeExists(employeeId)) {
      return false;
    }

    const records = this.timeTrackingRecords.value;
    const activeSession = records.find(r => r.employeeId === employeeId && r.endTime === null);

    if (activeSession) {
      return false;
    }

    const newRecord: TimeTracking = {
      id: this.generateId(),
      employeeId,
      startTime: formatBrazilianDate(),
      endTime: null,
      date: formatBrazilianDate()
    };

    this.timeTrackingRecords.next([...records, newRecord]);
    this.saveToLocalStorage();

    return true;
  }

  checkOutEmployee(employeeId: number): boolean {
    const records = this.timeTrackingRecords.value;
    const index = records.findIndex(r => r.employeeId === employeeId && r.endTime === null);

    if (index === -1) {
      return false;
    }

    const updatedRecords = [...records];
    updatedRecords[index] = {
      ...updatedRecords[index],
      endTime: formatBrazilianDate()
    };

    this.timeTrackingRecords.next(updatedRecords);
    this.saveToLocalStorage();

    return true;
  }

  private generateId(): number {
    const records = this.timeTrackingRecords.value;
    return records.length > 0
      ? Math.max(...records.map(r => r.id)) + 1
      : 1;
  }

  isEmployeeCheckedIn(employeeId: number): boolean {
    return this.timeTrackingRecords.value.some(r => r.employeeId === employeeId && r.endTime === null);
  }
}
