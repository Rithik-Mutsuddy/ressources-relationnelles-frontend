import { User } from "./user.model";

export interface Activity {
  id: number;
  name: string;
  description: string;
  startAt: string;
  endAt?: string;
  maxParticipants?: number;
  createdBy: Pick<User, 'id' | 'firstname' | 'lastname'>;
}