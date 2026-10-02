// An assigned function hands its receiver to code that can replace the slot.
// Its own array return cannot narrow subsequent invocations.
function make() { foreign(this); return [8, 9]; }
const box = {};
box.fn = make;
box.fn();
use(box.fn().includes("bc"));
