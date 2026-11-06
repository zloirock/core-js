import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A paired selection uses the common branch mirror without taking ownership of its wrapper.
// Argument effects precede binding keys/defaults; a consumed assignment keeps the selected value.
function read(flag, source) {
  return (([{
    [(mark(), 'from')]: from,
    missing = fallback()
  }], extra) => [from, missing, extra])([(before(), flag ? Array : source)], after());
}
function captured(flag, source) {
  let hasOwn;
  const held = [{
    hasOwn
  }] = [flag ? Object : source];
  return [held, hasOwn];
}
export { read, captured };