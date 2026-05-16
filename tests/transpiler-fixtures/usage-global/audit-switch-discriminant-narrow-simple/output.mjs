import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
// `switch (box.kind) { case 'a': ...; case 'b': ... }` - canonical TS discriminated-union
// pattern. `findDiscriminantGuards` walks parent.parentPath and when SwitchCase is the
// parent, collects a positive guard `{field, value, positive: true}` for the explicit
// case test. without this leg the switch body operates on the unrefined union receiver
// and over-polyfills (e.g. `case 'a'` -> v: string narrow MUST emit only `es.string.repeat`,
// not also `es.array.at`; the canonical if/else equivalent is already narrowed correctly).
type Box = {
  kind: 'a';
  v: string;
} | {
  kind: 'b';
  v: number[];
};
function probe(box: Box) {
  switch (box.kind) {
    case 'a':
      box.v.repeat(2);
      break;
    case 'b':
      box.v.at(-1);
      break;
  }
}