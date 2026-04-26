// `var x = require('core-js/...')` is a runtime alias, not a static side-effect entry,
// and must not be substituted by the entry-global rewrite.
const pkg = 'core-js/actual/array/from';
require(pkg);
