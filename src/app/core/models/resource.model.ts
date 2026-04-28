import { Category } from "./category.model";
import { User } from "./user.model";

export type ResourceStatus     = 'pending' | 'published' | 'rejected';
export type ResourceVisibility = 'public' | 'private';
export type ResourceType       = 'article' | 'video' | 'guide' | 'activity';

export interface Resource {
  id: number;
  title: string;
  content: string;
  type: ResourceType;
  status: ResourceStatus;
  visibility: ResourceVisibility;
  createdAt: string;
  updatedAt?: string;
  author: Pick<User, 'id' | 'firstname' | 'lastname'>;
  category?: Category;
}

export interface ResourceFilters {
  type?: ResourceType;
  categoryId?: number;
  search?: string;
  visibility?: ResourceVisibility;
}