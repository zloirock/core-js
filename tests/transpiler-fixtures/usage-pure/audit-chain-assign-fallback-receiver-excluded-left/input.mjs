// chain-assignment within destructure receiver: `c = (A || B)` evaluates to its right-hand side, which the
// fallback-receiver peel reaches through the store. A left the build does not serve (`globalThis.Map`, its
// constructor entry excluded, while `groupBy` keeps its own) keeps both operands, each polyfilled where the
// assignment stands, and the static is claimed off that left beside it. `c`, declared nowhere, is the realm's slot:
// the constructor it stores leaves the file and takes its whole entry
const { groupBy } = (c = (globalThis.Map || Set));
groupBy;
