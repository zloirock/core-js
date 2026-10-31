// `T extends (infer U)[] ? U : never` applied at a declare-const annotation - the raw
// conditional resolves through the infer pattern so `.at(0)` dispatches to String-specific
type First<T> = T extends (infer U)[] ? U : never;
declare const s: First<string[]>;
s.at(0);
