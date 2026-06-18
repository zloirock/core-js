// A function param reassigned via MULTIPLE same-name destructuring-pattern writes to different globals.
// usage-global must union BOTH branches' statics: M can be Object or Array at the call, so M.from needs
// es.array.from (Object has no static from). The reaching-value recovery pairs each estree param-violation
// Identifier to its OWN assignment by node identity - a by-name match collapsed every `[M] = ...` onto the
// first and dropped Array, under-injecting es.array.from versus babel. The const declarator is pre-formatted
// multiline so babel's printer and unplugin's text passthrough byte-converge.
function f(M, a, b) {
  const O = Object,
    A = Array;
  if (a) [M] = [O];
  if (b) [M] = [A];
  M.from([1]);
}
