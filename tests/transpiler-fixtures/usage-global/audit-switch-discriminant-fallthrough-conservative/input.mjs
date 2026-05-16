// `case 'a': case 'b': X` - fall-through chain requires OR-of-values which the AND-
// semantics `guards.every` filter can't express directly. fix bails conservatively when
// the preceding case can fall through (`canFallThrough(cases[caseIndex-1])` true), leaving
// the multi-value case unnarrowed. observable as over-polyfill (both string and array
// variants of `.at`) which is safe at runtime - both branches still resolve their members.
type Box = { kind: 'a'; v: string } | { kind: 'b'; v: number[] };
function probe(box: Box) {
  switch (box.kind) {
    case 'a':
    case 'b':
      box.v.at(-1);
      break;
  }
}
