import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
// A body-extracted static alias narrows the calls through its own binding only. A parameter or a
// catch clause of the same name nested in the alias's scope holds another value, so a call through
// it dispatches generically: the static's array helper would hand a string its own missing method.
// The read of the alias itself keeps its narrow.
const {
  from,
  ...rest
} = Array;
export const own = from([1, 2]).keys();
export function param(from) {
  return from('xy').at(0);
}
export function caught(error) {
  try {
    throw error;
  } catch (from) {
    return from('xy').includes('x');
  }
}