import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faUser, faEdit, faTrash, faPlus, faSave, faTimes, faClock} from '@fortawesome/free-solid-svg-icons';
import { Employee } from '@models/employee.model';
import { Subscription } from 'rxjs';
import {EmployeeService} from '@services/employee.service';
import {TimeTracking} from '@models/time-tracking.model';
import {TimeTrackingService} from '@services/time-tracking.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  timeTrackingRecords: TimeTracking[] = [];
  employeeForm: FormGroup;
  editMode = false;
  selectedEmployee: Employee | null = null;
  viewingEmployee: Employee | null = null;

  private subscription = new Subscription();

  clockIcon = faClock;
  userIcon = faUser;
  editIcon = faEdit;
  deleteIcon = faTrash;
  addIcon = faPlus;
  saveIcon = faSave;
  cancelIcon = faTimes;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private timeTrackingService: TimeTrackingService
  ) {
    this.employeeForm = this.fb.group({
      id: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      name: ['', [Validators.required]],
      position: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.subscription.add(
      this.employeeService.getEmployees().subscribe(data => {
        this.employees = data;
      })
    );
    this.subscription.add(
      this.timeTrackingService.getTimeTrackingRecords().subscribe(records => {
        this.timeTrackingRecords = records;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  addEmployee(): void {
    if (this.employeeForm.valid) {
      const newEmployee: Employee = {
        id: parseInt(this.employeeForm.value.id),
        name: this.employeeForm.value.name,
        position: this.employeeForm.value.position
      };

      const success = this.employeeService.addEmployee(newEmployee);

      if (!success) {
        alert('ID já existe. Por favor, use um ID diferente.');
        return;
      }

      this.employeeForm.reset();
    }
  }


  editEmployee(employee: Employee): void {
    this.selectedEmployee = employee;
    this.editMode = true;

    this.employeeForm.patchValue({
      id: employee.id,
      name: employee.name,
      position: employee.position
    });

    this.employeeForm.get('id')?.disable();
  }

  updateEmployee(): void {
    if (this.employeeForm.valid && this.selectedEmployee) {
      const updatedEmployee: Employee = {
        id: this.selectedEmployee.id,
        name: this.employeeForm.value.name,
        position: this.employeeForm.value.position
      };

      this.employeeService.updateEmployee(updatedEmployee);
      this.cancelEdit();
    }
  }

  removeEmployee(id: number): void {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      this.timeTrackingService.deleteEmployeeRecords(id);
      this.employeeService.removeEmployee(id);
    }
  }

  viewEmployeeTimeRecords(employee: Employee): void {
    this.viewingEmployee = employee;
    if (this.editMode && this.selectedEmployee?.id !== employee.id) {
      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    this.editMode = false;
    this.selectedEmployee = null;
    this.employeeForm.reset();
    this.employeeForm.get('id')?.enable();
  }

  getEmployeeTimeRecords(employeeId: number): TimeTracking[] {
    return this.timeTrackingRecords.filter(record => record.employeeId === employeeId);
  }

  formatDuration(startTime: Date, endTime: Date | null): string {
    if (!endTime) return 'Em andamento';

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationMs = end - start;

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }
}
