// Global injection leaves a source-owned pure namespace and its reads intact.
import I from "@core-js/pure/actual/iterator";
export const range = I.range;
