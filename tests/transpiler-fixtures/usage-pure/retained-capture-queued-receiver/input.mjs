// A retained nested claim shares the earlier flat claim's receiver and initializer.
// The prefix executes once, before either property read.
export function readCaptured(box, effect) {
  let at, flat;
  ({ at, M: { flat } } = (effect(), box));
  return [at, flat];
}
