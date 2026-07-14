// usage-global twin of the mutator-call retype bail: a registry-marked mutating method
// invalidates element precision, so the read widens and injects BOTH families
const pushed = [[1], [2]];
pushed.push([3]);
export const viaMutatorCall = pushed[0].includes(3);
