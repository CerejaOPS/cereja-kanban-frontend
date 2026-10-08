import { useState, useEffect } from "react";
import { Task, ChecklistItem, TaskComment } from "../../types/Task";
import styles from "./TaskDetailsModal.module.css";

// Propriedades a receber
interface Props {
  task: Task | null; // Task clicada
  isOpen: boolean; // Modal aparece ou nao
  onClose: () => void; // Função para fechar
  onSave?: (updatedTask: Task) => void; // Atualizar task no board
  onDelete?: (taskId: number) => void; // Excluir task
}

// Mocks
const MOCK_CHECKLIST: ChecklistItem[] = [
  { id: 1, text: "Definir modelo de dados", completed: true },
  { id: 2, text: "Desenvolver componente de interface", completed: false },
  { id: 3, text: "Criar teste de integração", completed: false },
];

const MOCK_COMMENTS: TaskComment[] = [
  {
    id: 1,
    authorName: "agbram",
    text: "zzzzzzzzzzzzzzzz",
    createdAt: "há 3 dias",
  },
];

export function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: Props) {
  // Estados locais para edição dos campos de tarefa
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [activeTab, setActiveTab] = useState<"checklist" | "comments">(
    "checklist",
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Estados para Checklist e Comentarios
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    task?.checklist || MOCK_CHECKLIST,
  );
  const [newChecklistText, setNewChecklistText] = useState("");

  const [comments, setComments] = useState<TaskComment[]>(
    task?.comments || MOCK_COMMENTS,
  );
  const [newCommentText, setNewCommentText] = useState("");

  // Sempre que a task recebida mudar, sincroniza os estados locais
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setChecklist(task.checklist || MOCK_CHECKLIST);
      setComments(task.comments || MOCK_COMMENTS);
      setConfirmDelete(false);
    }
  }, [task]);

  // Não renderiza caso não estiver aberto ou não houver task selecionada
  if (!isOpen || !task) return null;

  // Função auxiliar para escolher a classe CSS da badge prioridade
  function getPriorityBadgeClass(priority?: string) {
    switch (priority) {
      case "baixa":
        return styles.badgeBaixa;
      case "media":
        return styles.badgeMedia;
      case "alta":
        return styles.badgeAlta;
      case "urgente":
        return styles.badgeUrgente;
      default:
        return styles.badgeBaixa;
    }
  }

  // Funções Checklist: alternar status (toggle), apagar e adicionar novo item
  function handleToggleChecklist(id: number) {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id == id ? { ...item, completed: !item.completed } : item,
      ),
    );
  }

  function handleDeleteChecklist(id: number) {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  }

  function handleAddChecklistItem() {
    if (!newChecklistText.trim()) return;

    const newItem: ChecklistItem = {
      id: Date.now(),
      text: newChecklistText.trim(),
      completed: false,
    };
    setChecklist((prev) => [...prev, newItem]);
    setNewChecklistText("");
  }

  // Função dos comentarios: adiciona nova mensagem com autor e data
  function handleAddComment() {
    if (!newCommentText.trim()) return;
    const newComment: TaskComment = {
      id: Date.now(),
      authorName: "Você",
      text: newCommentText.trim(),
      createdAt: "Agora mesmo",
    };
    setComments((prev) => [...prev, newComment]);
    setNewCommentText("");
  }

  // Salvar e fechar -> envia a tarefa para o componente pai
  function handleCloseAndSave() {
    setConfirmDelete(false);
    if (onSave) {
      onSave({
        ...task!,
        title,
        description,
        checklist,
        comments,
      });
    }
    onClose();
  }

  // Calculo de progresso do checklist
  const totalItems = checklist.length;
  const completedItems = checklist.filter((i) => i.completed).length;
  const progressPercent =
    totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className={styles.overlay} onClick={handleCloseAndSave}>
      {/* stopPropagation evita que o clique dentro da caixa feche o modal */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho Completo */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.topRow}>
              <span className={styles.taskId}>#{task.id}</span>
              <span
                className={`${styles.badge} ${getPriorityBadgeClass(task.priority)}`}
              >
                {task.priority || "baixa"}
              </span>
              <span className={styles.taskId}>
                • Fase: {task.phase.toUpperCase()}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.titleInput}
              placeholder="Título da tarefa..."
            />
          </div>

          {/* Seus botões de confirmação e fechar (que você fez certinho) */}
          <div
            style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
          >
            {confirmDelete ? (
              <div className={styles.confirmDeleteBox}>
                <span className={styles.confirmText}>Excluir mesmo?</span>
                <button
                  type="button"
                  className={styles.btnDangerYes}
                  onClick={() => onDelete?.(task.id)}
                >
                  Sim
                </button>
                <button
                  type="button"
                  className={styles.btnDangerNo}
                  onClick={() => setConfirmDelete(false)}
                >
                  Não
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.deleteTaskBtn}
                onClick={() => setConfirmDelete(true)}
                title="Excluir tarefa"
              >
                🗑️ Excluir
              </button>
            )}
            <button className={styles.closeButton} onClick={handleCloseAndSave}>
              ✕
            </button>
          </div>
        </div>

        {/* Corpo */}
        <div className={styles.body}>
          {/* Responsável */}
          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Responsável</span>
            <div className={styles.assigneeBox}>
              <div className={styles.avatar}>
                {task.assignee?.name
                  ? task.assignee.name.charAt(0).toUpperCase()
                  : "?"}
              </div>
              <span>{task.assignee?.name || "Não atribuído"}</span>
            </div>
          </div>

          {/* Descrição */}
          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Descrição</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              placeholder="Adicione uma descrição detalhada para a tarefa..."
            />
          </div>

          {/* Abas */}
          <div>
            <div className={styles.tabs}>
              <button
                className={`${styles.tabBtn} ${activeTab === "checklist" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("checklist")}
              >
                Subtarefas ({completedItems}/{totalItems})
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === "comments" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("comments")}
              >
                Comentários ({comments.length})
              </button>
            </div>

            {/* Conteúdo da Aba Checklist */}
            {activeTab === "checklist" && (
              <div style={{ marginTop: "1rem" }}>
                <div className={styles.progressContainer}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {checklist.map((item) => (
                  <div key={item.id} className={styles.checkItem}>
                    <div className={styles.checkLeft}>
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklist(item.id)}
                        style={{ cursor: "pointer" }}
                      />
                      <span
                        className={
                          item.completed ? styles.checkTextCompleted : ""
                        }
                      >
                        {item.text}
                      </span>
                    </div>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteChecklist(item.id)}
                      title="Excluir subtarefa"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <div className={styles.addRow}>
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddChecklistItem()
                    }
                    placeholder="Adicionar subtarefa..."
                    className={styles.input}
                  />
                  <button
                    className={styles.btnAction}
                    onClick={handleAddChecklistItem}
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            )}

            {/* Conteúdo da Aba Comentários */}
            {activeTab === "comments" && (
              <div style={{ marginTop: "1rem" }}>
                <div className={styles.commentList}>
                  {comments.length === 0 && (
                    <p style={{ color: "#71717a", fontSize: "0.875rem" }}>
                      Nenhum comentário ainda.
                    </p>
                  )}
                  {comments.map((comment) => (
                    <div key={comment.id} className={styles.commentItem}>
                      <div className={styles.commentHeader}>
                        <span className={styles.authorName}>
                          {comment.authorName}
                        </span>
                        <span className={styles.commentDate}>
                          {comment.createdAt}
                        </span>
                      </div>
                      <p className={styles.commentText}>{comment.text}</p>
                    </div>
                  ))}
                </div>
                <div className={styles.addRow}>
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    placeholder="Escreva um comentário..."
                    className={styles.input}
                  />
                  <button
                    className={styles.btnAction}
                    onClick={handleAddComment}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
