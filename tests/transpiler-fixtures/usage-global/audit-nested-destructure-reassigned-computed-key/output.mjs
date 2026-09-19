import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// a computed inner key in a nested proxy destructure resolves to its REACHING value, not the dead
// declarator init: `K` reaches 'from' at the destructure, so es.array.from injects (not es.array.of).
// the key's own path is threaded so babel and unplugin agree on the reaching value
var K = 'of';
K = 'from';
const {
  Array: {
    [K]: m
  }
} = globalThis;
m([1, 2]);