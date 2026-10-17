const brr: string[] = ["a"];
(brr.includes as any) = function () { return true; };
export const r2 = brr.includes("a");
