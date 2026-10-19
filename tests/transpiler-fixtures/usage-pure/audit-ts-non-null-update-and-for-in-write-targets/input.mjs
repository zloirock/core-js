// two more usage-pure write positions a frozen import binding cannot occupy, each reached through
// a TS-non-null wrapper: an UpdateExpression operand (`Map!++`) and a for-in head (`for (Set! in obj)`).
// both stay the global with no import - the wrapper is peeled before the write-position test
// @ts-expect-error an update through a cast, which tsc refuses, is the shape under test
Map!++;
// @ts-expect-error a loop head write tsc refuses is the shape under test
for (Set! in obj) noop();
