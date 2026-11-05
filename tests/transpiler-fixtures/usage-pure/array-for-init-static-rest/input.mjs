// A for-init capture keeps the callback before of is initialized and excludes Array from rest.
// The served static leaf comes from array/of without moving the rest read.
export function collect(observe) {
  for (const [{ Array: { of }, ...rest }] = [(observe(() => of), globalThis)];;) {
    return [of(3), rest];
  }
}
