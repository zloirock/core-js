// A returned pure index retains its supplied method identity in both modes.
import P from "@core-js/pure/actual/promise";
function get() { hit(); return { P }; }
export const all = get().P.all;
