import _Reflect from "@core-js/pure/actual/reflect";
let kWhile = "ownKeys";
export function inWhileTest(obj, step) {
  while (_Reflect[kWhile](obj).length && step()) {
    kWhile = "has";
  }
}