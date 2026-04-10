type U = { x: string[] } | { x: number[] };

declare const u: U;

u.x.at(-1);
