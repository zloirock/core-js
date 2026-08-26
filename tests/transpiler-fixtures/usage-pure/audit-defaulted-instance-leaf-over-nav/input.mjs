// a DEFAULTED instance leaf over a NAV receiver: the guard the extraction renders reads that
// receiver exactly once, which is what the source's own read does, so a proxy-rooted nav and a
// side-effect-free member both serve it. left in the residual the claim shipped native, and on a
// target without the method the source's default won over the ponyfill - the stripped realm reads
// that as the default's value where native reads a function
const { flat = null } = globalThis.Array.prototype;
const { at: bareAt = null } = Array.prototype;
let assigned;
({ flat: assigned = null } = globalThis.Array.prototype);
// NEGATIVE: an opaque receiver keeps the residual - its dispatch may answer undefined and the
// default the source wrote must still fire
function opaque() { return { flat: undefined }; }
const { flat: fromOpaque = null } = opaque();
export { flat, bareAt, assigned, fromOpaque };
