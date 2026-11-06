// An array hole preserves the exact position of the following realm element.
// The native Map extraction still provides the hint for the later groupBy call.
const [, { Map: HM }] = [, globalThis];
export const viaHoleBeforeSlot = HM.groupBy([3, 4], v => v);
