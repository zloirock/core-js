import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Preceding-block-assignment narrowing relies on straight-line ordering between the
// assignment, the use, and any later mutation. When the use is captured in a closure
// declared between the assignment and a subsequent reassignment, that ordering no
// longer holds at invocation time. Plugin must keep the full union polyfill set.
type U = {
  kind: 'a';
  method: () => string;
} | {
  kind: 'b';
  method: () => Array<number>;
};
function g() {
  let u: U = {
    kind: 'a',
    method: () => 'hi'
  };
  const cb = function () {
    u.method().at(0);
  };
  u = {
    kind: 'b',
    method: () => [42]
  };
  return cb();
}