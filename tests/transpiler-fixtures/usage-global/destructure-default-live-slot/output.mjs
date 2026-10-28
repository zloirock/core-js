import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// The receiver getter runs once. The default stays live through child rewrites,
// before a later computed key; that key and the residual keep their source order.
const events = [];
function source() {
  events.push('init');
  return {
    get at() {
      events.push('get');
    },
    other: 3
  };
}
export function consume(held) {
  const {
    at: read = (events.push('default'), Array.from),
    [(events.push('key'), 'other')]: other
  } = held;
  return [read({
    0: 7,
    length: 1
  }), other, events];
}
export const result = consume(source());