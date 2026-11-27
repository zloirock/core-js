const source = [[3]];
source[Symbol.iterator] = function * () { yield 'word'; };
var rows;
{ var [...rows] = source; }
export const first = rows[0].at(0);
