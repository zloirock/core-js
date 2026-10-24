// A discarded assignment inside a sequence still binds both instance methods.
// Captures retain the native array levels before reading the selected receiver.
let at, flat;
const result = (([[{ at, flat }]] = [[[1, [2]]]]), 7);
use(at, flat, result);
