// a GUARDED ctor-slot shim (`if (!('Map' in self)) self.Map = ...`) is a slot mutation like
// any other: the in-check stays DYNAMIC (folding to `true` would skip the install exactly
// where it is needed) and the bare ctor read follows the live slot - native where present,
// the user's shim where not
if (!('Map' in self)) self.Map = function () { /* shim */ };
module.exports = new Map();
