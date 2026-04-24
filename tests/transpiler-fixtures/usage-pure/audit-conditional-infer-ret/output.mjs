import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `T extends (infer U)[] ? U : never` applied at a declare-const annotation - the raw
// conditional resolves through the infer pattern so `.at(0)` dispatches to String-specific
type First<T> = T extends (infer U)[] ? U : never;
declare const s: First<string[]>;
_atMaybeString(s).call(s, 0);