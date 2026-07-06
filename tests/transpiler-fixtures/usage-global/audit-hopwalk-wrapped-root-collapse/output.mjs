import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.number.is-finite";
import "core-js/modules/es.string.raw";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// usage-global twin of the wrapped-root hop collapse: sequence-tail, parenthesized and
// sequence-then-assign roots must all contribute their leaf usage to the import set exactly
// like a bare root. distinct constructors and methods per line attribute a missed root.
let e = 0,
  f = 0,
  q;
const g = globalThis;
export const seqRoot = (e++, globalThis).self.Object.values({});
export const parenRoot = globalThis.self.Iterator;
export const seqAssignRoot = (f++, q = globalThis).self.Number.isFinite(1);
export const aliasSeqRoot = (e++, g).self.String.raw({
  raw: []
});