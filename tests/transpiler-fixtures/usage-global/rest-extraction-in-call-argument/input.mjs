// A rest extraction in a call argument is owned by its local sequence.
let from, rest;
use(({ from, ...rest } = Array));
