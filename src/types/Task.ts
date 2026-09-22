export interface Task {
  id: number;
  title: string;
  phase: string;
  description?: string;
  priority?: 'baixa' | 'media' | 'alta' | 'urgente';
  assignee?: {name: string; avatarUrl?: string; discordId?: string};
  checklist?: ChecklistItem[];
  comments?: TaskComment[];
}

export interface ChecklistItem{
  id: number;
  text: string;
  completed: boolean;
}

export interface TaskComment{
  id: number;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
}