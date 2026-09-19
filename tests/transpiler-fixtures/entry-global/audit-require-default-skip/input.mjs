// `require('core-js/...').default` is a member-access on a runtime require, not a
// static entry-import; the plugin must leave it alone.
const arrayFrom = require('core-js/actual/array/from');
const { all } = require('core-js/actual/promise');
