import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.concat";
import "core-js/modules/es.array.species";
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
export function alwaysTrue(box: Box) {
  // @ts-expect-error a call on a union receiver tsc cannot type is the shape under test
  if (typeof Promise != 'undefined' || box.kind === 'text') return box.data.concat('d');
}