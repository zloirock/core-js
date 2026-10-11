// a write through a selection of a container and an undefined value lands on the container - the other arm
// holds no slot - so a static read back through the selection owes the written constructor's family
const voided = flag ? { C: Object } : void 0;
voided.C = Map;
export const grouped = voided.C.groupBy([1], x => x);
