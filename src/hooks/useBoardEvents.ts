import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function useBoardEvents(boardId: number) {
  const queryClient = useQueryClient();
  useEffect(() => {
    const eventSource = new EventSource(
      `http://localhost:8080/api/events/boards/${boardId}`,
    );

    function handleEvent() {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }

    eventSource.addEventListener("TASK_CREATED", handleEvent);
    eventSource.addEventListener("TASK_MOVED", handleEvent);
    eventSource.addEventListener("TASK_UPDATED", handleEvent);
    return () => {
      eventSource.close();
    };
  }, [boardId, queryClient]);
}
