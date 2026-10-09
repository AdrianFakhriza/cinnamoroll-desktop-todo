export interface Task {
  id: string;
  text: string;
  completed: boolean;
  repeatable: boolean;
  lastCompletedDate: string | null;
  reminderTime: string | null;
  reminderNotified: boolean;
}
