import { useTasks } from './hooks/useTask'
import { KanbanBoard } from './components/KanbanBoard';
import styles from './App.module.css';

function App() {
  const { tasks, handleMove } = useTasks();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cereja Kanban</h1>
      <KanbanBoard tasks={tasks} onMove={handleMove} />
    </div>
  );
}

export default App;