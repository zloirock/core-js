// inline-array spread args expand positionally for the per-branch synth: the receiver
// param maps through ...[...] exactly like plain args (raw arguments indexing bailed the
// branch synth and left the native static unpolyfilled); a dynamic spread stays undecidable
let c = true;
const r = ((x, { from }) => from)(...[1, c ? Array : Iterator]);
r([2]);
