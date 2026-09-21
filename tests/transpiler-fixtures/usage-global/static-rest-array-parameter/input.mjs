// Closed parameter binding copies enumerable rest keys, not the constructor's standard statics.
// Global needs only from; pure retains the supplied receiver and native parameter reads.
function read([{ from, ...rest }]) { return [from([1]), rest]; }
read([Array]);
