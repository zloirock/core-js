// receiver-rewrite on array destructure wrapping object destructure:
// `function f([{from}] = [Array])`. The outer array destructure has an object-destructure
// element; receiver-rewrite targets the outer array receiver, but the rewrite requires
// a bare object destructure as the target (not nested inside an array destructure).
// The plugin emits as-is - covers the nested-pattern-bail invariant
function f([{
  from
}] = [Array]) {
  return from;
}
f();