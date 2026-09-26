// optional computed access `obj?.[Symbol.iterator]`: the well-known symbol must still
// be recognised as an iteration probe even through optional chaining.
arr?.[Symbol.iterator]();
