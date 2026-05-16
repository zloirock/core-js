import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
// `switch (box.kind) { case 'a': ...; default: ... }` - default-branch narrow. when no
// preceding case falls through, default body sees the union minus every explicit case
// value. emit negative guards for each explicit case test - filter excludes branches
// where `kind === <explicit value>`, leaving only the unmatched variants.
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
    default:
      box.v.at(-1);
      break;
  }
}