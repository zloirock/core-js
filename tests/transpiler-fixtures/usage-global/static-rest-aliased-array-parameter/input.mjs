// Closed parameter binding copies enumerable rest keys, not the constructor's standard statics.
// Global needs only from; pure retains the supplied receiver and native parameter reads.
const source = [Array];
function read([{ from, ...rest }]) { return from([1]); }
export const result = read(source);
export const intact = source[0] === Array;
