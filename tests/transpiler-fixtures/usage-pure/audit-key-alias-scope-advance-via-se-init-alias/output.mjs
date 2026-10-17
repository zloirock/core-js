import _Array$from from "@core-js/pure/actual/array/from";
// a computed-key ALIAS resolves in its own declaration scope, hop by hop: a use-site shadow
// of an init name must not swallow the module-level value the alias actually holds, and an
// alias of the shadow itself must stay unresolved
const j = 'from';
// an SE-carrying alias init keeps its effect at the declaration and still names the key
let seCount = 0;
const seKey = (seCount++, j);
export const viaSeInitAlias = _Array$from([6]);