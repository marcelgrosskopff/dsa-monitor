"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export function MobileNavMenu({
  items,
  current,
  inverse,
}: {
  items: { href: string; label: string }[];
  current: string;
  inverse: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={ref} className={`dsa-nav__mobile${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="dsa-nav__burger"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true" className="dsa-nav__burger-lines">
          <span />
          <span />
          <span />
        </span>
      </button>

      {open && (
        <div className="dsa-nav__drawer" role="dialog" aria-label="Site navigation">
          <ul className="dsa-nav__drawer-list">
            {items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className="dsa-nav__drawer-link"
                  aria-current={current === it.href ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {it.label}
                  <span aria-hidden="true" className="dsa-nav__drawer-arrow">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
