// Shared capture and receiver-default routes preserve independently supported claims.
// Native iteration, source effects and residual bindings stay in order.
export function collect(observe) {
  for (const [{ Array: { of }, ...rest }] = [(observe(() => of), globalThis)];;) {
    return [of(3), rest];
  }
}
