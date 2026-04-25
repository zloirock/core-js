// `super[(fn(), 'try')]()` in static context: computed key carries a SequenceExpression
// with a side-effect head. when the key resolves to a known static name and routes through
// the inherited-static remap, the SE prefix must NOT be dropped - it has to fire at the
// original evaluation point, before the polyfill call
let counter = 0;
function fn() { counter++; return null; }
class C extends Promise {
  static run() { return super[(fn(), 'try')](() => 1); }
}
export { C, counter };
