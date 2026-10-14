// A `!` between two links ABOVE a claim continues the claim's chain: the guard its `?.` owes covers
// the continuation past the assertion - after a plain dispatch, past a stacked assertion, after a
// dispatch whose own optional call re-opens the chain, and after two optional dispatches joined into
// one guard. A `?.` after the assertion re-guards the result outside.
declare const nums: number[] | null;
declare const strs: string[] | null;
declare const lists: any[] | null;
nums?.at(-1).toFixed(2)!.length;
nums?.findLastIndex(Boolean).toExponential(1).toString()!!.length;
lists?.[0].flat?.()!.length;
lists?.[0].includes?.(1)!.valueOf();
lists?.[1].flatMap?.(x => [x]).toSorted?.()!.length;
lists?.with?.(0, 2).toReversed?.()!.length;
strs?.findLast(Boolean).padEnd(2)!?.toString();
