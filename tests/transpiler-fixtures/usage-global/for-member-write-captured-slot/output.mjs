import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A slot written through a captured alias can select a different receiver in the body.
const inner = {
  value: []
};
const box = {
  inner
};
for (box.inner.value.at of [0]) {
  inner.value = 'abc';
  consume(box.inner.value.at(-1));
}