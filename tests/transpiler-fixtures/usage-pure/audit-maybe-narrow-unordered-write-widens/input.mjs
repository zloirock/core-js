// MAYBE-NARROW: a reassignment the resolver can ORDER narrows precisely - the call below it sees the
// later value, so the string-specific helper is right. a write it cannot order (a callback, a
// conditional, another function) must widen to the generic helper: a type-specific Maybe hands a
// foreign receiver that receiver's OWN method, absent on ie:11, and the emitted call then throws
let ordered = [1];
ordered = 'ab';
export const a = ordered.at(0);

let viaCallback = [1];
[0].forEach(() => { viaCallback = 'ab'; });
export const b = viaCallback.at(0);

let conditional = [1];
if (c) conditional = 'ab';
export const d = conditional.at(0);

let viaFunction = [1];
function reassign() { viaFunction = 'ab'; }
export const e = viaFunction.at(0);
