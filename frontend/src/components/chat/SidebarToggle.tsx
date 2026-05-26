type Props = {
  isOpen: boolean;
  onToggle: () => void;
};

export default function SidebarToggle({ isOpen, onToggle }: Props) {
  return (
    <button
      className="chat-sidebar-toggle"
      type="button"
      onClick={onToggle}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 5h12M3 9h12M3 13h12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
