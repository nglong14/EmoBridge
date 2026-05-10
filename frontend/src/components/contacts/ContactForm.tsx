import { type FormEvent, useState } from "react";

import { ApiError, api, type Channel, type Contact } from "../../lib/api";

type Props = {
  initial?: Contact;
  onSave: (contact: Contact) => void;
  onCancel: () => void;
};

export default function ContactForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [relationship, setRelationship] = useState(initial?.relationship ?? "");
  const [channel, setChannel] = useState<Channel>(initial?.channel ?? "EMAIL");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [consentSms, setConsentSms] = useState(initial?.consentSms ?? false);
  const [consentEmail, setConsentEmail] = useState(initial?.consentEmail ?? false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [issues, setIssues] = useState<{ path: string; message: string }[]>([]);

  const isSms = channel === "SMS";
  const isValid =
    name.trim().length > 0 &&
    (isSms ? Boolean(phone.trim()) && consentSms : Boolean(email.trim()) && consentEmail);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setErrorMsg(null);
    setIssues([]);
    setSubmitting(true);

    const payload = {
      name: name.trim(),
      relationship: relationship.trim() || undefined,
      channel,
      phone: isSms ? phone.trim() : undefined,
      email: !isSms ? email.trim() : undefined,
      consentSms: isSms ? consentSms : undefined,
      consentEmail: !isSms ? consentEmail : undefined,
    };

    try {
      const result = initial
        ? await api.updateContact(initial.id, payload)
        : await api.createContact(payload);
      onSave(result.contact);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
        setIssues(err.issues ?? []);
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="contact-form-panel">
      <p className="contact-form-title">{initial ? "Edit contact" : "Add contact"}</p>

      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        {errorMsg && (
          <p className="form-error" role="alert">
            {errorMsg}
            {issues.length > 0 && (
              <ul>
                {issues.map((issue) => (
                  <li key={issue.path}>
                    <strong>{issue.path}:</strong> {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </p>
        )}

        <div className="form-row">
          <div>
            <label className="field-label" htmlFor="cf-name">
              Name
            </label>
            <input
              id="cf-name"
              className="text-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="cf-relationship">
              Relationship <span className="field-optional">(optional)</span>
            </label>
            <input
              id="cf-relationship"
              className="text-input"
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g. Partner, Friend, Therapist"
            />
          </div>
        </div>

        <label className="field-label" htmlFor="cf-channel">
          Channel
        </label>
        <select
          id="cf-channel"
          className="select-input"
          value={channel}
          onChange={(e) => setChannel(e.target.value as Channel)}
        >
          <option value="EMAIL">Email</option>
          <option value="SMS">SMS</option>
        </select>

        {isSms ? (
          <>
            <label className="field-label" htmlFor="cf-phone">
              Phone number
            </label>
            <input
              id="cf-phone"
              className="text-input"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
            />
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={consentSms}
                onChange={(e) => setConsentSms(e.target.checked)}
              />
              This person has consented to receive SMS messages on my behalf
            </label>
          </>
        ) : (
          <>
            <label className="field-label" htmlFor="cf-email">
              Email address
            </label>
            <input
              id="cf-email"
              className="text-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="they@example.com"
            />
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={consentEmail}
                onChange={(e) => setConsentEmail(e.target.checked)}
              />
              This person has consented to receive emails on my behalf
            </label>
          </>
        )}

        <div className="contact-form-actions">
          <button
            className="button primary-button"
            type="submit"
            disabled={submitting || !isValid}
          >
            {submitting ? "Saving…" : initial ? "Save changes" : "Add contact"}
          </button>
          <button className="button ghost-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
