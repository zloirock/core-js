import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// resolving an identifier down to the global-proxy ROOT is ONE surface with several arm shapes -
// each cell pins one arm. positives inject the arm-only marker; the negative arm must NOT register
// a ctor alias (named keys off an array literal are always undefined)
import g from "@core-js/pure/actual/global-this";
export const viaImportMember = g.Map.groupBy([], x => x);

// a `.default` hop off a CJS-interop-wrapped global-proxy require re-enters the global surface
// mid-chain, exactly like the top-level interop read
function _interopRequireDefault(m) {
  return m && m.__esModule ? m : {
    default: m
  };
}
var X = _interopRequireDefault(require("@core-js/pure/actual/global-this"));
export const viaInteropDefault = X.default.Promise.try(() => 1);

// NEGATIVE: an ObjectPattern destructuring an ARRAY literal reads named keys - always undefined,
// so no ctor alias registers and no reflect static injects
const {
  Reflect: R
} = [globalThis];
export const notAnAlias = R;

// a bare-identifier array element binds the WHOLE proxy-global positionally
const [gb] = [globalThis];
export const viaBareElement = gb.Array.of(1);

// a constant COMPUTED key in the proxy-global destructure root folds like the literal spelling
const KEY = 'self';
const {
  [KEY]: sc
} = globalThis;
export const viaComputedRoot = sc.Object.entries({
  a: 1
});

// the TS require-import twin binds the same global - one import surface serves both forms
import gte = require("@core-js/pure/actual/global-this");
export const viaTsImportEquals = gte.Iterator.from([1]);

// the `export` modifier does not change the local binding's value
export import gE = require("@core-js/pure/actual/global-this");
export const viaExportImport = gE.Promise.allSettled([1]);

// NEGATIVE: `.default` off the TS-equals binding is NOT an interop hop - the binding already
// IS the global, whose `default` slot is undefined (es.promise.race must not appear)
import XD = require("@core-js/pure/actual/global-this");
export const notInterop = () => (XD as never as {
  default: {
    Promise: PromiseConstructor;
  };
}).default.Promise.race([]);

// NEGATIVE: an inner shadow swallows the import - the local object's method stays native
// (es.object.from-entries must not appear)
import gS = require("@core-js/pure/actual/global-this");
export function shadowed() {
  const gS = {
    Object: {
      fromEntries: (x: Iterable<[string, number]>) => x
    }
  };
  return gS.Object.fromEntries([['a', 1]]);
}