// `case 'a': case 'b': X` - a fall-through chain needs OR-of-values, which the AND-semantics
// guard set can't express. when the preceding case can fall through, narrowing must bail and
// leave the multi-value case unrefined. observable as over-polyfill (both string and array
// variants of `.at`), safe at runtime - both branches still resolve their members.
type Box = { kind: 'a'; v: string } | { kind: 'b'; v: number[] };
function probe(box: Box) {
  switch (box.kind) {
    case 'a':
    case 'b':
      box.v.at(-1);
      break;
  }
}
