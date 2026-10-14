import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.math.log2";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.concat";
import "core-js/modules/es.array.copy-within";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.fill";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.find-index";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.join";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.splice";
import "core-js/modules/es.array.to-reversed";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.to-spliced";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.array.values";
import "core-js/modules/es.array.with";
import "core-js/modules/es.global-this";
import "core-js/modules/es.math.acosh";
import "core-js/modules/es.math.asinh";
import "core-js/modules/es.math.atanh";
import "core-js/modules/es.math.cbrt";
import "core-js/modules/es.math.clz32";
import "core-js/modules/es.math.cosh";
import "core-js/modules/es.math.expm1";
import "core-js/modules/es.math.fround";
import "core-js/modules/es.math.f16round";
import "core-js/modules/es.math.hypot";
import "core-js/modules/es.math.imul";
import "core-js/modules/es.math.log10";
import "core-js/modules/es.math.log1p";
import "core-js/modules/es.math.sign";
import "core-js/modules/es.math.sinh";
import "core-js/modules/es.math.sum-precise";
import "core-js/modules/es.math.tanh";
import "core-js/modules/es.math.to-string-tag";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A for-of head that ASSIGNS mirrors each claim into the iterated element. A computed key naming no
// known slot stops that mirror, so the head relocates into the body, where the static claim beside the
// key extracts and the residual keeps the key - an object hop and a realm hop alike; unplugin reads that
// residual through the collapsed hop (sidecar).
let from, trunc, other;
const key = pick();
for ({
  w: {
    [key]: other,
    from
  }
} of [{
  w: Array
}]) break;
for ({
  Math: {
    trunc,
    [key]: other
  }
} of [globalThis]) break;
export { from, trunc, other };