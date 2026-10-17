import "core-js/modules/es.reflect.has";
import "core-js/modules/es.reflect.own-keys";
export function inWhileTest(obj, step) {
  let kWhile = "ownKeys";
  while (Reflect[kWhile](obj).length && step()) {
    kWhile = "has";
  }
}