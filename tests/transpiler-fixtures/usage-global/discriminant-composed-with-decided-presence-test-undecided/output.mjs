import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// A discriminant check composed with a presence test this build always answers narrows by the part of the test that runs: a test
// always false leaves `||` to its right, a test always true leaves `&&` to it, a decided conditional its live arm, an exit's too -
// and a write to the discriminant after it drops the narrow as it would after the bare check.
type Box = {
  kind: 'text';
  data: string;
} | {
  kind: 'list';
  data: number[];
};
declare const flag: boolean;
export function undecided(box: Box) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  if (flag || box.kind === 'text') return box.data.flat();
}