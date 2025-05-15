import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faUser, faEdit, faTrash, faPlus, faSave, faTimes, faClock} from '@fortawesome/free-solid-svg-icons';
import {Employee} from '@models/employee.model';
import {Subscription} from 'rxjs';
import {EmployeeService} from '@services/employee.service';
import {TimeTracking} from '@models/time-tracking.model';
import {TimeTrackingService} from '@services/time-tracking.service';
import {formatBrazilianDate} from "../../../utils/DateUtils";
import {DailyTimeRecord} from "@models/daily-time-record.model";

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
    protected employeeForm: FormGroup;
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
    selectedDate: Date | null = null;
    selectedMonth: string | null = null

    constructor(
        private fb: FormBuilder,
        private employeeService: EmployeeService,
        private timeTrackingService: TimeTrackingService
    ) {
        this.employeeForm = this.fb.group({
            id: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
            name: ['', [Validators.required]],
            position: ['', [Validators.required]],
            monthlyHours: ['', [Validators.required]]
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

    onDateChange(event: any): void {
        console.log(formatBrazilianDate(event.target.value, true))
        this.selectedDate = formatBrazilianDate(event.target.value, true);
    }

    clearDateFilter(): void {
        this.selectedDate = null;
    }

    onMonthChange(event: any): void {
        this.selectedMonth = event.target.value;
        this.selectedDate = null;
    }

    clearMonthFilter(): void {
        this.selectedMonth = null;
    }

    getGroupedDailyRecords(employeeId: number): DailyTimeRecord[] {
        if (!this.selectedMonth) return [];

        const [year, monthNum] = this.selectedMonth.split('-');
        const yearNum = parseInt(year);
        const month = parseInt(monthNum) - 1;

        const records = this.timeTrackingRecords.filter(record => {
            const recordDate = formatBrazilianDate(record.date);
            return record.employeeId === employeeId &&
                recordDate.getFullYear() === yearNum &&
                recordDate.getMonth() === month;
        });

        const recordsByDay = new Map<string, TimeTracking[]>();

        records.forEach(record => {
            const recordDate = formatBrazilianDate(record.date);
            const dateKey = recordDate.toDateString();

            if (!recordsByDay.has(dateKey)) {
                recordsByDay.set(dateKey, []);
            }

            recordsByDay.get(dateKey)?.push(record);
        });

        const dailyRecords: DailyTimeRecord[] = [];

        recordsByDay.forEach((dayRecords, dateKey) => {
            const date = new Date(dateKey);
            let totalMs = 0;

            dayRecords.forEach(record => {
                if (record.endTime) {
                    const start = formatBrazilianDate(record.startTime).getTime();
                    const end = formatBrazilianDate(record.endTime).getTime();
                    totalMs += (end - start);
                }
            });

            const hours = Math.floor(totalMs / (1000 * 60 * 60));
            const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));

            dailyRecords.push({
                date,
                totalHoursWorked: `${hours}h ${minutes}m`,
                records: dayRecords
            });
        });

        return dailyRecords.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    addEmployee(): void {
        if (this.employeeForm.valid) {
            const newEmployee: Employee = {
                id: parseInt(this.employeeForm.value.id),
                name: this.employeeForm.value.name,
                position: this.employeeForm.value.position,
                monthlyHours: this.employeeForm.value.monthlyHours
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
            position: employee.position,
            monthlyHours: employee.monthlyHours
        });

        this.employeeForm.get('id')?.disable();
    }

    updateEmployee(): void {
        if (this.employeeForm.valid && this.selectedEmployee) {
            const updatedEmployee: Employee = {
                id: this.selectedEmployee.id,
                name: this.employeeForm.value.name,
                position: this.employeeForm.value.position,
                monthlyHours: this.employeeForm.value.monthlyHours
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
        let records = this.timeTrackingRecords.filter(record => record.employeeId === employeeId);

        if (this.selectedDate) {
            records = this.getRecordsByDay(records);
        } else if (this.selectedMonth) {
            records = this.getRecordByMonth(records);
        }

        return records;
    }

    private getRecordByMonth(records: TimeTracking[]) {
        return records.filter(record => {
            const recordDate = formatBrazilianDate(record.date);
            return this.selectedMonth === `${recordDate.getFullYear()}-${(recordDate.getMonth() + 1).toString().padStart(2, '0')}`;
        });
    }

    private getRecordsByDay(records: TimeTracking[]) {
        return records.filter(record => {
            const recordDate = formatBrazilianDate(record.date);
            return recordDate.getDate() === this.selectedDate?.getDate() &&
                recordDate.getMonth() === this.selectedDate?.getMonth() &&
                recordDate.getFullYear() === this.selectedDate?.getFullYear();
        });
    }

    getTotalHoursWorkedForDate(employeeId: number, date: Date): string {
        let totalMs = 0;

        const records = this.timeTrackingRecords.filter(record => {
            const recordDate = formatBrazilianDate(record.date);
            return record.employeeId === employeeId &&
                recordDate.toDateString() === date.toDateString();
        });

        records.forEach(record => {
            if (record.endTime) {
                const start = formatBrazilianDate(record.startTime).getTime();
                const end = formatBrazilianDate(record.endTime).getTime();
                totalMs += (end - start);
            }
        });

        const hours = Math.floor(totalMs / (1000 * 60 * 60));
        const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    }

    getTotalHoursWorkedForMonth(employeeId: number, month: string): string {
        let totalMs = this.caculateTotalMsOfTheMonth(month, employeeId);

        const hours = Math.floor(totalMs / (1000 * 60 * 60));
        const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    }

    formatDuration(startTime: Date, endTime: Date | null): string {
        if (!endTime) return 'Em andamento';

        const start = formatBrazilianDate(startTime).getTime();
        const end = formatBrazilianDate(endTime).getTime();
        const durationMs = end - start;

        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    }

    getDifferenceFromMonthlyHours(employeeId: number, month: string): string {
        // Get monthly hours from employee
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee || !employee.monthlyHours) {
            return 'N/A';
        }

        // Calculate worked time in minutes
        let totalMs = this.caculateTotalMsOfTheMonth(month, employeeId);

        // Convert worked time to hours
        const workedMinutes = Math.floor(totalMs / (1000 * 60));

        // Calculate required minutes from monthly hours
        const requiredMinutes = employee.monthlyHours * 60;

        // Calculate difference
        const diffMinutes = workedMinutes - requiredMinutes;
        const absMinutes = Math.abs(diffMinutes);

        const hours = Math.floor(absMinutes / 60);
        const minutes = absMinutes % 60;

        const prefix = diffMinutes >= 0 ? '+' : '-';
        return `${prefix}${hours}h ${minutes}m`;
    }

    private caculateTotalMsOfTheMonth(month: string, employeeId: number) {
        let totalMs = 0;
        const [year, monthNum] = month.split('-');

        const records = this.timeTrackingRecords.filter(record => {
            const recordDate = formatBrazilianDate(record.date);
            return record.employeeId === employeeId &&
                recordDate.getFullYear() === parseInt(year) &&
                recordDate.getMonth() === parseInt(monthNum) - 1;
        });

        records.forEach(record => {
            if (record.endTime) {
                const start = formatBrazilianDate(record.startTime).getTime();
                const end = formatBrazilianDate(record.endTime).getTime();
                totalMs += (end - start);
            }
        });
        return totalMs;
    }
}
