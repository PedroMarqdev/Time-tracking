export interface TimeTracking {
  id: number;
  employeeId: number;
  startTime: Date;
  endTime: Date | null;
  date: Date;
}
