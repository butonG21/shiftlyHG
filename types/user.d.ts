export interface User {
    _id: string;
    name: string;
    username: string; // Sama dengan employeeId
    role?: string;     // Opsional, bisa "admin", "staff", dll.
  }
  