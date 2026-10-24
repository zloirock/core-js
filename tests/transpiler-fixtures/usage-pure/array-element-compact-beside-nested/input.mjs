// A compact extraction preserves a neighbouring nested pattern until its own extraction finishes.
export function read(source) {
  const [{ value: { flat }, keep }] = [source], [{ at }] = [[1, 2]];
  return [flat, keep, at];
}
