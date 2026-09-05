import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.species";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
// a nested leaf in a for-x head reads a SLOT of the element, not the element: where the iterable is
// a literal of object literals the walk descends that slot per element and folds. answering the
// element type instead handed the leaf the plain-object answer, which resolves to no polyfill at
// all - the module went missing and the dispatcher widened. the fold rides the nav that replaces
// the pattern, so the leg that REWRITES its head answers it the same. a cross-family fold answers
// nothing, so both families reach the leaf
const seen = [];
for (const {
  y: {
    at
  }
} of [{
  y: [1]
}]) seen.push(at);
for (const {
  y: {
    includes
  }
} of [{
  y: [1]
}, {
  y: 'ab'
}]) seen.push(includes);
for (const {
  y: {
    map
  }
} of [{
  x: 1
}]) seen.push(map);
export { seen };