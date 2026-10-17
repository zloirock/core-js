// a for-UPDATE write runs 0+ times (never on a zero-iteration loop), so it must not pin the
// post-loop static to the updated key
export function afterLoop(c) {
  let kP = "allSettled";
  for (; c(); kP = "any");
  return Promise[kP]([1]);
}
