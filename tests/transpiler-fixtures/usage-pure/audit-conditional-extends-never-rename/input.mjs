// `T extends never ? A : B` - never is the bottom type per TS spec; nothing extends it
// (except never itself). a non-primitive Array (T = number[]) does not extend the primitive
// never, so the conditional picks the false branch deterministically (T = number[]). without
// the rule, the Promise-vs-Array fold collapses to Object and loses the Array hint.
type Wrap<T> = T extends never ? Promise<unknown> : T;
declare const r: Wrap<number[]>;
r.at(0);
r.includes(1);
