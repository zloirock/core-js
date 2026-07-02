import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// IIFE chain `(()=>()=>Promise)()()` exceeds the single-hop inline ceiling and must bail to generic.
// Same shape via named bindings (`outer -> inner -> Promise`) resolves because each step is an identifier.
const r1 = (() => () => _Promise)()().resolve(1);
const inner = () => _Promise;
const outer = () => inner();
const r2 = _Promise$resolve(2);
export { r1, r2 };