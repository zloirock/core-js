// IIFE chain `(()=>()=>Promise)()()` exceeds the single-hop inline ceiling and must bail to generic.
// Same shape via named bindings (`outer -> inner -> Promise`) resolves because each step is an identifier.
const r1 = (() => () => Promise)()().resolve(1);
const inner = () => Promise;
const outer = () => inner();
const r2 = outer().resolve(2);
export { r1, r2 };
