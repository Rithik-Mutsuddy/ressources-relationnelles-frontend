export type InteractionType = 'favorite' | 'progress' | 'aside' | 'share';

export interface ResourceInteraction {
  id: number;
  type: InteractionType;
  createdAt: string;
}