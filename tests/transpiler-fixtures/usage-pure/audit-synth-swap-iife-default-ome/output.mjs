import _Array$from from "@core-js/pure/actual/array/from";
// IIFE default with an OptionalMemberExpression receiver (`{from} = globalThis?.Array`).
// synth-swap previously rejected the OME via a strict Identifier-or-MemberExpression check
// and silently fell through to the inline-default fallback, even though the proxy-global
// classifier already handles optional `?.` shapes - so the optional receiver must be
// accepted and synth-swapped, not dropped.
function f({
  from
} = {
  from: _Array$from
}) {
  return from([1, 2, 3]);
}
f();