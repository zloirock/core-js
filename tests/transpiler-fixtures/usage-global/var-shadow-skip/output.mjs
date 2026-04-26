import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// `var Array = require(...)` shadows global at top scope yet `Array.from` and `.prototype.at` calls
// reference the local require value; static analysis bails on the rebinding, but instance/at
// pollution still applies because the prototype call uses the global Array.prototype receiver
var Array = require('./array');
var Promise = require('./promise');
Array.from(x);
new Promise(fn);
Array.prototype.at.call(y, -1);