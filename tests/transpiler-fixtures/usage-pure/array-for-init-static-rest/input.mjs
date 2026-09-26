// The initializer observes the static binding before initialization; rest excludes its hop.
export function collect(observe) {
  for (const [{ Array: { of }, ...rest }] = [(observe(() => of), globalThis)];;) {
    return [of(3), rest];
  }
}
