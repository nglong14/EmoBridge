import ModelSelector from "./ModelSelector";

export default function Topbar() {
  return (
    <div className="chat-topbar">
      <ModelSelector />
      <div className="chat-topbar-actions" />
    </div>
  );
}
