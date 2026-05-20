import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Nav from "../components/Nav";
import ContactForm from "../components/contacts/ContactForm";
import ContactList from "../components/contacts/ContactList";
import { ApiError, api, type Contact } from "../lib/api";

export default function ContactsPage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .listContacts()
      .then(({ contacts: list }) => setContacts(list))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          void navigate("/signin", { replace: true });
        } else {
          setLoadError("Could not load contacts. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(contact: Contact) {
    setEditing(contact);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  function handleSave(saved: Contact) {
    setContacts((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx === -1) return [saved, ...prev];
      return prev.map((c) => (c.id === saved.id ? saved : c));
    });
    closeForm();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Remove this contact from your trust list?")) return;
    setDeletingId(id);
    try {
      await api.deleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        void navigate("/signin", { replace: true });
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main>
      <Nav />
      <div className="contacts-page">
        <div className="contacts-header">
          <h1 className="contacts-title">Trust List</h1>
          {!formOpen && (
            <button className="button primary-button" type="button" onClick={openCreate}>
              + Add contact
            </button>
          )}
        </div>

        {formOpen && (
          <ContactForm key={editing?.id ?? "new"} initial={editing ?? undefined} onSave={handleSave} onCancel={closeForm} />
        )}

        {loading && (
          <div className="contacts-list" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <div className="contact-card contact-skeleton" key={i} aria-hidden="true">
                <div className="contact-card-body">
                  <div className="skeleton-line skeleton-line--name" />
                  <div className="skeleton-line skeleton-line--meta" />
                </div>
              </div>
            ))}
          </div>
        )}
        {loadError && (
          <p className="form-error" role="alert">
            {loadError}
          </p>
        )}
        {!loading && !loadError && (
          <ContactList
            contacts={contacts}
            onEdit={openEdit}
            onDelete={(id) => void handleDelete(id)}
            deletingId={deletingId}
          />
        )}
      </div>
    </main>
  );
}
