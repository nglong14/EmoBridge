import { useCallback } from "react";

import SidebarTop from "./SidebarTop";
import ConversationList from "./ConversationList";
import SidebarBottom from "./SidebarBottom";

type Props = {
  activeConversationId: string | null;
  refreshSignal: number;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
};

export default function Sidebar({
  activeConversationId,
  refreshSignal,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
}: Props) {
  const handleDelete = useCallback(
    async (id: string) => {
      onDeleteConversation(id);
    },
    [onDeleteConversation],
  );

  return (
    <aside className="chat-sidebar" aria-label="Chat sidebar">
      <SidebarTop onNewChat={onNewChat} />
      <ConversationList
        activeId={activeConversationId}
        onSelect={onSelectConversation}
        onDelete={handleDelete}
        onRename={onRenameConversation}
        refreshSignal={refreshSignal}
      />
      <SidebarBottom />
    </aside>
  );
}
