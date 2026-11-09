// A nested assignment default retains the pattern's static receiver.
let length, other;
({ groupBy: { length = 9 }, other } = Map);
use(length, other);
