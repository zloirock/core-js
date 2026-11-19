import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// the pristine gate reads the RESOLVED hop name, so a slot the file rewrites stops the fold through
// every spelling of its key alike - the hop holds the user's own object and keeps its place over the
// deepest span pure can back. the `delete` arm answers with the read: the operator names a slot rather
// than reading a value, but it navigates the same object, so a hop spelled through a binding or a
// folded concatenation deopts the run exactly where its dotted and literal twins do.
// own file - the write below deopts the slot for every row beside it, which is the point
_globalThis.window = userWindow;
const hopKey = 'window';
export const boundKey = _self[hopKey].probe;
export const literalKey = _self['window'].probe;
export const dotted = _self.window.probe;
export const concatKey = _self['win' + 'dow'].probe;
export const deletedLiteralKey = delete _self['window'].userSlot;
export const deletedBoundKey = delete _self[hopKey].userSlot;
export const deletedConcatKey = delete _self['win' + 'dow'].userSlot;