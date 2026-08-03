"use client";

import type { FormEvent } from "react";
import { Button } from "./core";

/**
 * Field — labelled text input / textarea.
 * Visible persistent <label> tied via htmlFor/id (never placeholder-as-label);
 * required marked in label; errors via aria-describedby + role="alert".
 */
export function Field({
  id,
  label,
  type = "text",
  required = false,
  multiline = false,
  error,
  ...props
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) {
  const describedBy = error ? `${id}-error` : undefined;
  const controlCls = `dsa-field__control${
    error ? " dsa-field__control--error" : ""
  }`;
  return (
    <div className="dsa-field">
      <label htmlFor={id} className="dsa-field__label">
        {label}
        {required && <span className="dsa-field__req"> *</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          required={required}
          aria-describedby={describedBy}
          rows={5}
          className={controlCls}
          {...props}
        />
      ) : (
        <input
          id={id}
          type={type}
          required={required}
          aria-describedby={describedBy}
          className={controlCls}
          {...props}
        />
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="dsa-field__error">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * ContactForm — composed from Field + Button. Accessible name on the <form>; one submit;
 * status announced via a polite live region; required fields marked in label + native required.
 */
export function ContactForm({
  status,
  onSubmit,
}: {
  status?: string;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form aria-label="Contact OIAT" className="dsa-form" onSubmit={onSubmit}>
      <Field id="name" label="Name" required />
      <Field id="email" label="Email" type="email" required />
      <Field id="message" label="Message" multiline required />
      <Button type="submit" arrow>
        Send message
      </Button>
      <p role="status" aria-live="polite" className="dsa-form__status">
        {status}
      </p>
    </form>
  );
}
