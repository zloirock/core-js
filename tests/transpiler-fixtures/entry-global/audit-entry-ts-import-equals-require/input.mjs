// TypeScript-style `import alt = require('core-js/...')` is a runtime entry import,
// not a type-only declaration. shared `getEntrySource` recognises the shape; both
// babel-plugin and unplugin must process it identically. without the filter widening
// in babel-plugin's entry detection, babel silently passed the declaration through
// while unplugin rewrote it to individual core-js entries, producing a cross-adapter
// rewrite divergence
import alt = require('core-js/actual/array/at');
foo();
