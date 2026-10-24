// a BRANCHING slot of the literal a call yields holds either arm: pure guards the read against each
// at runtime and usage-global injects the static of each. the arms share their static, and the Map
// arm owes its constructor entry beside it
const either = () => ({ a: flag ? Object : Map });
const { a: viaBranching } = either();
export const fromBranching = viaBranching.groupBy([1], v => v);
