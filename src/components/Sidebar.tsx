import { useState } from "react";
import {
  MessageSquarePlus,
  Trash2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Bot,
} from "lucide-react";
import type { Conversation } from "../lib/supabase";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <aside
      className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}
    >
      <div className="sidebar__header">
        {!collapsed && (
          <div className="sidebar__brand">
            <Bot size={22} className="sidebar__brand-icon" />
            <span className="sidebar__brand-name">Claude Chat</span>
          </div>
        )}
        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <button className="sidebar__new-btn" onClick={onNew} title="New conversation">
        <MessageSquarePlus size={18} />
        {!collapsed && <span>New Conversation</span>}
      </button>

      <nav className="sidebar__nav">
        {conversations.length === 0 && !collapsed && (
          <p className="sidebar__empty">No conversations yet</p>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`sidebar__item ${activeId === conv.id ? "sidebar__item--active" : ""}`}
            onClick={() => onSelect(conv.id)}
            onMouseEnter={() => setHoveredId(conv.id)}
            onMouseLeave={() => setHoveredId(null)}
            title={conv.title}
          >
            <MessageSquare size={16} className="sidebar__item-icon" />
            {!collapsed && (
              <>
                <span className="sidebar__item-title">{conv.title}</span>
                {(hoveredId === conv.id || activeId === conv.id) && (
                  <button
                    className="sidebar__item-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                    title="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
