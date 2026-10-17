// a write through a selection of a container and an undefined value lands on the container - the other arm
// holds no slot - so a pattern over the selection reads the written constructor, whose static it keeps
const unset = flag ? { C: Object } : undefined;
unset.C = Map;
const { C } = unset;
export const grouped = C.groupBy([1], x => x);
