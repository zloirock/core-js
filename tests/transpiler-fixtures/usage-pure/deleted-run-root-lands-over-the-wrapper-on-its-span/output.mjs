import _globalThis from "@core-js/pure/actual/global-this";
// the root binding a deleted navigation folds onto lands in the slot the run's own claim would take,
// the TS wrapper written over the run included: the bare binding needs no assertion
const realm = () => _globalThis;
export const castOverTheRun = delete _globalThis.castSlot;
// @ts-expect-error a realm member the lib does not declare stands for any global the user adds
export const nonNullOverTheRun = delete _globalThis.nonNullSlot;