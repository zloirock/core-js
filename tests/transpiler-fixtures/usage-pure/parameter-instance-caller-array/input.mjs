// A closed caller supplies an array receiver and selects only Array dispatchers.
// Each method is read once at function entry after the arguments finish.
function read({ at, flat }) { return [at, flat]; }
export const result = read([1, [2]]);
