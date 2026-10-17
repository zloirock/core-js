export function iteratedInFunction() {
  let held;
  {
    const Array = Iterator;
    held = Array;
  }
  return held.from([1, 2]);
}
