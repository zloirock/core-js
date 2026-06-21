// TypeScript-style `import alt = require('core-js/...')` is a runtime entry import,
// not a type-only declaration. both babel-plugin and unplugin must recognise the shape
// and rewrite it identically; before the fix babel silently passed it through while
// unplugin rewrote it to individual core-js entries, a cross-adapter divergence
import alt = require('core-js/actual/array/at');
foo();
