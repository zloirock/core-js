// A discriminant check composed with a presence test this build always answers narrows by the part of the test that runs: a test
// always false leaves `||` to its right, a test always true leaves `&&` to it, a decided conditional its live arm, an exit's too -
// and a write to the discriminant after it drops the narrow as it would after the bare check.
type Box = { kind: 'text'; data: string } | { kind: 'list'; data: number[] };
declare const flag: boolean;
export function rewritten(box: Box, other: Box) {
  if (typeof Promise == 'undefined' ? flag : box.kind === 'text') {
    box.kind = other.kind;
    return box.data.slice(1);
  }
}
