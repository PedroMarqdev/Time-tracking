import { TimeTracking } from "./time-tracking.model";

export interface DailyTimeRecord {
  date: Date;
  totalHoursWorked: string;
  records: TimeTracking[];
}
