// A reassigned realm alias retains its prefix and dispatches on the actual prototype.
// Every written alternative yields an array receiver or throws before the method read.
let effects = 0;
let realm = globalThis;
const rebind = () => { realm = {}; };
const { Array: { prototype: { at, values } } } = (effects++, realm);
