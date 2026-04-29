// `require('core-js/...')` guarded by a runtime `if` is a conditional load, not a static
// entry-import; the plugin must leave it alone.
if (typeof window !== 'undefined') require('core-js/actual/array/from');