export interface Task {
  id: number;
  title: string;
  description?: string;
  priority?: string;
  color?: string;
  phase: string;
  board_id?: number;
  discord_user_id?: string;
  guild_id?: string;
  discord_thread_id?: string;
  assignee_discord_id?: string;
  assignee_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface Phase {
  id: string;
  name: string;
  description?: string;
  position: number;
  color?: string;
}
