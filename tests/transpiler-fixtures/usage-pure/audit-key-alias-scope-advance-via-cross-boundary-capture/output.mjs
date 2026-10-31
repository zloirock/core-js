// NEGATIVE: the alias captured its source BEFORE a later write crossed a closure boundary -
// the conservative bail keeps the raw dispatch reading the captured value
let crossSource = 'from';
export const viaCrossBoundaryCapture = () => Array[crossKey]?.([2]);
const crossKey = crossSource;
crossSource = 'of';