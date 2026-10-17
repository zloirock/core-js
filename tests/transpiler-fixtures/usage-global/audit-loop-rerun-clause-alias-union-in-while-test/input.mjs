export function inWhileTest(obj, step) {
  let kWhile = "ownKeys";
  while (Reflect[kWhile](obj).length && step()) { kWhile = "has"; }
}
