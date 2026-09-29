import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.global-this";
// The parameter reads a static from the constructor stored by a conditional pattern.
let P;
if (true) ({
  Promise: P
} = globalThis);
function f({
  try: t
} = P) {
  return typeof t;
}
export const result = f();