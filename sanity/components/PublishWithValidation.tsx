import { useState } from "react";
import {
  useValidationStatus,
  type DocumentActionComponent,
  type DocumentActionProps,
} from "sanity";

/**
 * Wraps Sanity's default Publish action. Natively, validation errors just grey
 * the button out with no explanation — editors are left guessing (reported as
 * a UX pain during client testing). With this wrapper, when required fields
 * are missing the button stays CLICKABLE, its label announces the problem,
 * and clicking opens a dialog listing exactly which fields block publishing.
 * When the document is valid, the native action is returned untouched.
 */

/** "metaDescription" → "Meta Description"; nested paths → first named field. */
function fieldLabel(path: readonly unknown[]): string {
  const first = path.find((seg) => typeof seg === "string") as string | undefined;
  if (!first) return "Unknown field";
  return first
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export function withValidationFeedback(
  Original: DocumentActionComponent,
): DocumentActionComponent {
  const PublishWithValidation: DocumentActionComponent = (
    props: DocumentActionProps,
  ) => {
    const original = Original(props);
    // Third arg mirrors the publish rules: references to unpublished
    // documents also block publishing, so they belong in the same dialog.
    const { validation } = useValidationStatus(props.id, props.type, true);
    const [open, setOpen] = useState(false);

    const errors = validation.filter((m) => m.level === "error");
    if (!original || errors.length === 0) return original;

    // Group messages by top-level field so one field with several rules
    // shows as a single entry.
    const byField = new Map<string, string[]>();
    for (const e of errors) {
      const label = fieldLabel(e.path);
      const list = byField.get(label) ?? [];
      list.push(e.message);
      byField.set(label, list);
    }

    return {
      ...original,
      disabled: false,
      tone: "caution",
      label: `Publish — ${byField.size} field${byField.size === 1 ? "" : "s"} missing`,
      title: "Some fields need attention before publishing — click to see which",
      onHandle: () => setOpen(true),
      dialog: open && {
        type: "dialog",
        header: "Not ready to publish yet",
        onClose: () => setOpen(false),
        content: (
          <div style={{ lineHeight: 1.5 }}>
            <p style={{ marginTop: 0 }}>
              To publish this document, fix the following:
            </p>
            <ul style={{ paddingLeft: 20 }}>
              {Array.from(byField.entries()).map(([label, messages]) => (
                <li key={label} style={{ marginBottom: 8 }}>
                  <strong>{label}</strong>
                  {messages.map((m, i) => (
                    <div key={i} style={{ opacity: 0.8, fontSize: 13 }}>
                      {m}
                    </div>
                  ))}
                </li>
              ))}
            </ul>
            <p style={{ opacity: 0.7, fontSize: 13 }}>
              Fields with problems are also marked in the form. Once fixed,
              this button becomes “Publish”.
            </p>
          </div>
        ),
      },
    };
  };
  PublishWithValidation.action = "publish";
  PublishWithValidation.displayName = "PublishWithValidation";
  return PublishWithValidation;
}
