import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// global-mode coverage for symbol-iterator chains. Symbol.iterator inside computed-key
// member access requires polyfill; the side-effect-free Symbol receiver doesn't shadow
const obj = {
  *[Symbol.iterator]() {
    yield 1;
    yield 2;
  }
};
for (const v of obj) console.log(v);