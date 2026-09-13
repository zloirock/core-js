// The runtime operand beside a conditional type annotation still reads its global.
// Only the type comparison's Number and Set mentions are erased.
export const value = Map as (Number extends Set<unknown> ? unknown : never);
