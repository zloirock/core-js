import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
// a bodyless `var` reading an instance method off a selection the build decides - as its receiver, in its
// key or in a call's argument - reads the operand that runs: the method's family loads for the live
// operand's type and never for the dead one's
function make(value) {
  return value;
}
export function pick(ready) {
  const box = {
    a: [1],
    b: 'ab'
  };
  if (ready) var {
    at
  } = typeof Symbol != 'undefined' ? [1] : 'ab';else var {
    includes
  } = box[typeof Symbol != 'undefined' ? 'a' : 'b'];
  label: var {
    concat = null
  } = make(typeof Symbol != 'undefined' ? 'ab' : [1]);
  return [at, includes, concat];
}