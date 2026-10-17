let u;
export function keep(x) {
  return x;
}
export const userConsumer = keep((u = globalThis.window)?.self?.self.Set);
