// A nested computed-key capture stays in the loop initializer and preserves its evaluation order.
export function head(make, outer, leaf) {
  for (let { [(outer(), 'w')]: { [(leaf(), 'at')]: method } } = make(); ;) return method;
}
