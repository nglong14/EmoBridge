import type { Contact } from "../../lib/api";
import ContactRow from "./ContactRow";

type Props = {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
};

export default function ContactList({ contacts, onEdit, onDelete, deletingId }: Props) {
  if (contacts.length === 0) {
    return (
      <div className="contacts-empty">
        <p>No contacts yet.</p>
        <p>Add someone to your trust list so EmoBridge can reach out on your behalf when it matters.</p>
      </div>
    );
  }

  return (
    <div className="contacts-list">
      {contacts.map((contact) => (
        <ContactRow
          key={contact.id}
          contact={contact}
          onEdit={() => onEdit(contact)}
          onDelete={() => onDelete(contact.id)}
          deleting={deletingId === contact.id}
        />
      ))}
    </div>
  );
}
