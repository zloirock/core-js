// A `!` between two links above a claim hides nothing from usage detection: the claims below the
// assertion, the dispatches whose optional call re-opens the chain and two optional dispatches
// joined into one guard pull their modules as they would without it, a `?.` after it included.
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
