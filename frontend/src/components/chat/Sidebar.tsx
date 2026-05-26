import { useCallback } from "react";

import SidebarTop from "./SidebarTop";
import ConversationList from "./ConversationList";
import SidebarBottom from "./SidebarBottom";
import { api } from "../../lib/api";

type Props = {
  onNewChat: () => void;
};

export default function Sidebar({ onNewChat }: Props) {
  const handleNewChat = useCallback(async () => {
    try {
      await api.clearMessages();
    } catch {
      // clear locally regardless
    }
    onNewChat();
  }, [onNewChat]);

  return (
    <aside className="chat-sidebar" aria-label="Chat sidebar">
      <SidebarTop onNewChat={handleNewChat} />
      <ConversationList />
      <SidebarBottom />
    </aside>
  );
}
