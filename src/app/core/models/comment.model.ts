import { User } from "./user.model";

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  isReported: boolean;
  user: Pick<User, 'id' | 'firstname' | 'lastname'>;
  replies?: Comment[];
}