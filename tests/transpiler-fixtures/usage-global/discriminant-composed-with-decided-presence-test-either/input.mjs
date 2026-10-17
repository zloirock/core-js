// A discriminant check composed with a presence test this build always answers narrows by the part of the test that runs: a test
// always false leaves `||` to its right, a test always true leaves `&&` to it, a decided conditional its live arm, an exit's too -
// and a write to the discriminant after it drops the narrow as it would after the bare check.
type Box = { kind: 'text'; data: string } | { kind: 'list'; data: number[] };
export function either(box: Box) {
  if (typeof Promise == 'undefined' || box.kind === 'text') return box.data.at(0);
}
