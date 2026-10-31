import _Map from "@core-js/pure/actual/map";
// The runtime operand beside a conditional type annotation still reads its global.
// Only the type comparison's Number and Set mentions are erased.
export const value = _Map;