var _Map = require("@core-js/pure/actual/map/constructor");
var _self = require("@core-js/pure/actual/self");
// a GUARDED ctor-slot shim (`if (!('Map' in self)) self.Map = ...`) under a presence test the build answers:
// the data subset carries `Map`, so the in-check folds to `true` and the install never runs - the write mutates
// no slot, and the bare ctor read takes the ponyfill, as it does under the truthy and `typeof` spellings of the
// same test. Leaving the read raw would throw wherever the engine lacks `Map`.
if (!true) _self.Map = function () {/* shim */};
module.exports = new _Map();