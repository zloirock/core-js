// A `!` inside an open optional chain hides nothing from usage detection: each method read past
// the assertion - on the claim's receiver and along its tail, a deleted member and an optional
// link included - pulls its modules as it would without it, and so do the sealed spellings.
declare const nums: number[] | null;
declare const strs: string[] | null;
nums?.at(-1)!.toFixed(2).toString();
nums?.findLastIndex(Boolean)!!.toExponential(1).length;
strs?.toString()!.padStart(4)[0];
strs?.join("")!.trimEnd().repeat(2).toUpperCase();
delete strs?.reduce((p, n) => p + n)!.padEnd(4).k;
strs?.reduceRight((p, n) => p + n)!.startsWith("a")?.valueOf();
(strs?.find(Boolean))!.endsWith("b").valueOf();
(strs?.findLast(Boolean) as string).includes("c").valueOf();
