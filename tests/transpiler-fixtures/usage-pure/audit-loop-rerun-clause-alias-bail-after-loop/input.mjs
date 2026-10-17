// a for-UPDATE write runs 0+ times (never on a zero-iteration loop), so it must not pin the
// post-loop static to the updated key - and the raw read off either key takes the whole entry
let kP = "allSettled";
export function afterLoop(c) {
  for (; c(); kP = "any");
  return Promise[kP]([1]);
}
