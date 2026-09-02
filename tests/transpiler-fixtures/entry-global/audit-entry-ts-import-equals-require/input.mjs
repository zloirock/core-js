// TypeScript-style `import alt = require('core-js/...')` binds a value the way `import alt from`
// and `const alt = require()` do: a binding import is never a side-effect entry, used or not, so
// it is left where the author wrote it with its binding intact - both legs alike. the bare
// `import 'core-js/...'` beside it is the entry
import alt = require('core-js/actual/array/at');
import unused = require('core-js/actual/array/of');
import 'core-js/actual/array/from';
console.log(alt);
