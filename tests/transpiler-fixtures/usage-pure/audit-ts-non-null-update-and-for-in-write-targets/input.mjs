// two more usage-pure write positions a frozen import binding cannot occupy, each reached through
// a TS-non-null wrapper: an UpdateExpression operand (`Map!++`) and a for-in head (`for (Set! in obj)`).
// both stay the global with no import - the wrapper is peeled before the write-position test
Map!++;
for (Set! in obj) noop();
