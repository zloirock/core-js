// receiver alias has two type-args; each callback parameter slot must narrow
// independently through the deep subst (`T -> number[]`, `U -> string[]`)
type Holder<T, U> = { use(cb: (a: T[], b: U[]) => void): void };
declare const h: Holder<number, string>;
h.use((a, b) => { a.at(0); b.findLast(Boolean); });
