// A first caller without the requested static cannot hide a later caller's Array.from.
// Each known caller contributes its selected static independently of earlier receivers.
function read({ from }) { return from; }
const First = Set;
read(First);
export const result = read(Array)([7]);
