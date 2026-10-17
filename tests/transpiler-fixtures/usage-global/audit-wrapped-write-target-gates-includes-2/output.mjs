import "core-js/modules/es.array.includes";
const crr: string[] = ["c"];
(crr.includes as any) += "y";
export const r3 = crr.includes("c");