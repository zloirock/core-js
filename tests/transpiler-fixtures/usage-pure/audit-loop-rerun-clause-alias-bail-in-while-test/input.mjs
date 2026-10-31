let kWhile = "ownKeys";
export function inWhileTest(obj, step) {
  while (Reflect[kWhile](obj).length && step()) { kWhile = "has"; }
}
