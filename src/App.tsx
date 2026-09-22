import { useState } from 'react';
import { useTasks } from './hooks/useTask'
import { KanbanBoard } from './components/KanbanBoard';
import { TaskDetailsModal } from './components/TaskDetailsModal';
import { Task } from './types/Task';
import styles from './App.module.css';

function App() {
  const { tasks, handleMove, handleUpdateTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cereja Kanban</h1>
      
      <KanbanBoard tasks={tasks} onMove={handleMove} 
        onCardClick={(task) => setSelectedTask(task)}
      />

      <TaskDetailsModal task={selectedTask} isOpen={selectedTask !== null} 
        onClose={() => setSelectedTask(null)} 
        onSave={(updatedTask) => { handleUpdateTask(updatedTask); setSelectedTask(null); 
        }}
      />
    </div>
  );
}

export default App;