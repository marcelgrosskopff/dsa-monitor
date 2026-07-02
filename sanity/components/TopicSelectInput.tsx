import { useEffect, useState, type ChangeEvent } from "react";
import { set, unset, useClient, type ReferenceInputProps } from "sanity";

type TopicOption = { _id: string; label: string; swatch: string };

/**
 * Dropdown input for a single-topic reference field. Replaces Sanity's default
 * "card + three-dot menu" UX with a native select. Tap → dropdown → pick.
 * No accidental drilldown into the referenced topic's edit view.
 */
export function TopicSelectInput(props: ReferenceInputProps) {
  const client = useClient({ apiVersion: "2025-01-01" });
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    client
      .fetch<TopicOption[]>(
        '*[_type == "topic"] | order(isPrimary desc, label asc) {_id, label, swatch}',
      )
      .then((data) => {
        if (!cancelled) {
          setTopics(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  const selected = props.value?._ref ?? "";

  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.currentTarget.value;
    props.onChange(id ? set({ _type: "reference", _ref: id }) : unset());
  };

  return (
    <select
      value={selected}
      disabled={loading}
      onChange={onChange}
      style={{
        width: "100%",
        padding: "10px 12px",
        fontSize: 14,
        lineHeight: 1.4,
        border: "1px solid var(--card-border-color, #333)",
        borderRadius: 3,
        background: "var(--card-bg-color, transparent)",
        color: "var(--card-fg-color, inherit)",
        fontFamily: "inherit",
      }}
    >
      <option value="">— Select a topic —</option>
      {topics.map((t) => (
        <option key={t._id} value={t._id}>
          {t.label} ({t.swatch})
        </option>
      ))}
    </select>
  );
}
