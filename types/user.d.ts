export interface User {
  _id: string;
  uid: string;
  name: string;
  username: string; // Sama dengan employeeId
  position?: string;
  role?: string; // Opsional, bisa "admin", "staff", dll.
  email?: string | null;
  location?: string;
  photoURL?: string;
  department?: string;
  phoneNumber?: string;
  joinDate?: string;
  schedule?: ScheduleItem[];
}

export interface ScheduleItem {
  date: string;
  shift: string;
  location?: string;
  notes?: string;
}
  