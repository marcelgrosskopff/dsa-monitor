import type { StringInputProps, TextInputProps } from "sanity";

/**
 * Wraps a string/text input with a live "N/limit characters" hint below it.
 * Turns amber when the count exceeds the limit. Non-blocking — just guidance.
 */
export const createCharacterCounter = (limit: number) =>
  function CharacterCounter(props: StringInputProps | TextInputProps) {
    const value = (props.value ?? "").toString();
    const count = value.length;
    const over = count > limit;
    return (
      <div>
        {props.renderDefault(props)}
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            lineHeight: 1.4,
            color: over ? "#b45309" : "#6b7280",
          }}
        >
          {count}/{limit} characters
          {over && " — may be truncated in Google results"}
        </div>
      </div>
    );
  };
