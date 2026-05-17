import { UserRole } from "./user.model";

export interface Account {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  roles: UserRole;
  createdAt: string;
}