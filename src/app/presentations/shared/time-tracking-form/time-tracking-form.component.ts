import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faClock } from '@fortawesome/free-solid-svg-icons';
import { TimeTrackingService } from '@services/time-tracking.service';
import { EmployeeService } from '@services/employee.service';

@Component({
  selector: 'app-time-tracking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './time-tracking-form.component.html',
  styleUrls: ['./time-tracking-form.component.scss']
})
export class TimeTrackingFormComponent implements OnChanges {
  @Input() selectedEmployeeId?: number;

  protected trackingForm: FormGroup;
  message: { text: string, isError: boolean } = { text: '', isError: false };

  userIcon = faUser;
  clockIcon = faClock;

  constructor(
    private fb: FormBuilder,
    private timeTrackingService: TimeTrackingService,
    private employeeService: EmployeeService
  ) {
    this.trackingForm = this.fb.group({
      id: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedEmployeeId'] && this.selectedEmployeeId) {
      this.trackingForm.patchValue({
        id: this.selectedEmployeeId
      });
    }
  }

  onSubmit(): void {
    if (this.trackingForm.valid) {
      const employeeId = parseInt(this.trackingForm.value.id);

      if (!this.employeeService.employeeExists(employeeId)) {
        this.showMessage('Funcionário não encontrado. Verifique o ID.', true);
        return;
      }

      if (this.timeTrackingService.isEmployeeCheckedIn(employeeId)) {
        if (this.timeTrackingService.checkOutEmployee(employeeId)) {
          this.showMessage('Ponto de saída registrado com sucesso!', false);
        } else {
          this.showMessage('Erro ao registrar ponto de saída.', true);
        }
      } else {
        if (this.timeTrackingService.checkInEmployee(employeeId)) {
          this.showMessage('Ponto de entrada registrado com sucesso!', false);
        } else {
          this.showMessage('Erro ao registrar ponto de entrada.', true);
        }
      }
    }
  }

  showMessage(text: string, isError: boolean): void {
    this.message = { text, isError };
    setTimeout(() => {
      this.message = { text: '', isError: false };
    }, 3000);
  }

  getEmployeeStatus(employeeId: string): string {
    if (!employeeId) return '';

    const id = parseInt(employeeId);
    if (!this.employeeService.employeeExists(id)) return 'not-found';

    return this.timeTrackingService.isEmployeeCheckedIn(id) ? 'checked-in' : 'ready';
  }
}
