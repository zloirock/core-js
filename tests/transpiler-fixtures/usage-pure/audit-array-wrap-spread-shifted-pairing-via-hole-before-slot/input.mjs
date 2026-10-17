// control: a HOLE before the slot is not a spread - positions stay static and the pairing
// folds (only a spread makes later positions runtime-determined)
const [, { Map: HM }] = [, globalThis];
export const viaHoleBeforeSlot = HM.groupBy([3, 4], v => v);
