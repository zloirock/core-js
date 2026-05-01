// Mix optional chain (`?.`) with static + instance polyfills: substituteInner
// candidate ordering covers raw -> deoptionalized -> guardRef-rewritten paths
const f = x => x?.flat?.()?.at?.(0);
const g = x => Array?.from?.(x)?.findLast?.(p);
