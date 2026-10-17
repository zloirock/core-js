export function conditionalWrite(c) {
  let z;
  if (c()) z = globalThis;
  while (z) {
    return z.Promise.allSettled([]);
  }
}
