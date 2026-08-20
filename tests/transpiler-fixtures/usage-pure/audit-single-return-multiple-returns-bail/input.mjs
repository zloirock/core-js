// two top-level ReturnStatements - the second sighting makes receiver resolution bail, so
// no static-method polyfill fires (the call stays raw with no `_Array$from` import, only
// callee identifiers may receive separate substitutions). distinct methods on each line so
// any accidental polyfill emission is traceable to its source line.
const arrFrom = (() => { return Array; return Set; })().from([1]);
const setIntersect = (() => { return Set; return Array; })().prototype.intersection;
export { arrFrom, setIntersect };
