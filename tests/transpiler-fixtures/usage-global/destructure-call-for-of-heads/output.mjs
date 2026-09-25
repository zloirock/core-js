import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.is";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.math.sinh";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a for-of HEAD over call elements pairs the same way: the alias holds the element's slot value, the
// head's nested claim mirrors the callee's literal in the element with the call kept ahead, and a
// head over SEVERAL elements - an IIFE and a call among them - claims per element. one static per row
const headed = () => ({
  a: Object
});
for (const {
  a: viaHead
} of [headed()]) use(viaHead.is(5, 5));
const headedDeep = () => ({
  n: Array
});
for (const {
  n: {
    of: viaHeadDeep
  }
} of [headedDeep()]) use(viaHeadDeep(6));
const built = () => ({
  a: Math
});
for (const {
  a: {
    sinh: viaTwoElements
  }
} of [(() => ({
  a: Math
}))(), built()]) use(viaTwoElements(1));