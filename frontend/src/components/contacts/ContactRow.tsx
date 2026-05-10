import type { Contact } from "../../lib/api";

type Props = {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
};

export default function ContactRow({ contact, onEdit, onDelete, deleting }: Props) {
  const channelClass = contact.channel === "SMS" ? "sms" : "email";
  const detail = contact.channel === "SMS" ? contact.phone : contact.email;

  function handleDelete() {
    if (window.confirm(`Remove ${contact.name} from your trust list?`)) {
      onDelete();
    }
  }

  return (
    <div className="contact-card">
      <div className="contact-card-body">
        <p className="contact-card-name">{contact.name}</p>
        <div className="contact-card-meta">
          <span className={`channel-badge ${channelClass}`}>{contact.channel}</span>
          {contact.relationship && <span>{contact.relationship}</span>}
          {detail && <span>{detail}</span>}
        </div>
      </div>

      <div className="contact-card-actions">
        <button className="button ghost-button contact-action-btn" type="button" onClick={onEdit}>
          Edit
        </button>
        <button
          className="button ghost-button contact-action-btn contact-action-btn--danger"
          type="button"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Removing…" : "Remove"}
        </button>
      </div>
    </div>
  );
}
