// A claim whose receiver wears `!` inside an open optional chain is guarded at the chain's top: the
// assertion ends nothing, so every plain link after the claim - a deleted member included - rides
// the guard's alternate. An optional link re-guards the result outside, and parens or a cast seal.
declare const nums: number[] | null;
declare const strs: string[] | null;
nums?.at(-1)!.toFixed(2).toString();
nums?.findLastIndex(Boolean)!!.toExponential(1).length;
strs?.toString()!.padStart(4)[0];
strs?.join("")!.trimEnd().repeat(2).toUpperCase();
// @ts-expect-error the member read is the probe, and the right answer is a type without it
delete strs?.reduce((p, n) => p + n)!.padEnd(4).k;
strs?.reduceRight((p, n) => p + n)!.startsWith("a")?.valueOf();
(strs?.find(Boolean))!.endsWith("b").valueOf();
(strs?.findLast(Boolean) as string).includes("c").valueOf();
