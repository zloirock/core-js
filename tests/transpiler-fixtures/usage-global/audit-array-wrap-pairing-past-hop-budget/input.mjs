// An array-wrapped parameter whose pattern and default pair POSITIONALLY at every level. Delivering
// the rendered replacement walks down to the target by span containment, and that walk is as long as
// the source nests - a hop budget on it stopped delivery past thirty-two levels and the receiver was
// printed raw, so the polyfill was lost on this emitter alone while the other still injected it.
export function paired([[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[{ from }]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]] = [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[Array]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]) {
  return from([1]);
}
