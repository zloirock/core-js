// A whole source import owns its constructor even when the static is outside the configured layer.
// Keep that receiver instead of adding a narrow constructor import.
import I from "@core-js/pure/actual/iterator";
export const range = I.range;