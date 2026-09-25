import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
// a for-of head destructuring INTO a member target: the target is a WRITE the loop performs, never a
// read asking for a polyfill, while the KEY is read off each element like its binding twin's
// (`for ({ includes: f } of rows)`) - the write-target skip must not swallow that read
const obj = {};
for ({
  a: obj.flat
} of items) {
  noop(obj.flat);
}
for ({
  includes: obj.includes
} of rows) {
  noop(obj.includes);
}