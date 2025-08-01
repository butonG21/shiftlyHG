export interface User {
    _id: string;
    name: string;
    username: string; // Sama dengan employeeId
    uid: string; 
    position?: string; 
    role?: string;     // Opsional, bisa "admin", "staff", dll.
  }
  