require("core-js/modules/es.array.at");
// A user write replaces this CommonJS import, despite its generated-looking name.
// A later array call needs an independent polyfill and must not call the replacement.
var _ref = require('@core-js/pure/actual/array/instance/at');
(_ref = replacement()) === null;
module.exports = [7].at(0);