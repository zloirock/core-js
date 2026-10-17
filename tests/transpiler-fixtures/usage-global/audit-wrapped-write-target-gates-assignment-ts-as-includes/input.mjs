const brr: string[] = ["a"];
(brr.includes as any) = function () { return true; };
