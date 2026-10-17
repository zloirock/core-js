import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A closed caller evaluates its yielded source before capturing the receiver.
// The suspension stays in the generator, and the instance read follows every argument.
const events = [];
function make(value) {
  events.push(value);
  return 'ab';
}
function* run() {
  return (({
    at
  }, other) => [at.call('ab', -1), other])(make(yield 'pause'), events.push('argument'));
}
const iterator = run();
const first = iterator.next();
export const r = [first, iterator.next('resume'), events];