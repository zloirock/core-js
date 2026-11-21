// A push into the same array makes the slot readable. This native slot read
// observes the narrow Map constructor used for a builtin mutator argument.
const installed = [];
installed.push(Map);
export const viaMutatorArg = typeof installed[0].groupBy;
