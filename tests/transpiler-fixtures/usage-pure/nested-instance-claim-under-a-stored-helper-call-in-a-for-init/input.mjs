// A nested instance claim under a stored call of a helper returning the realm, in a for-init: unlike its
// flat twin, the level keeps its pattern native.
let kw;
function mk() { return globalThis; }
for (const { y: { flat: a } } = kw = mk(), i = 0; i < 1;) break;
