// REF-ORDER: memo temporaries are numbered by the top-down walk, so an OUTER site takes a lower
// suffix than a site nested inside its own receiver argument - an innermost-first allocator would
// swap the two. hoisting a declaration into a function body reorders the printed `var` lines
// without touching the numbering, and both emitters have to agree on the whole sequence
export const a = p(q().at(0)).at(1);

export const b = c().at(0).d().at(1);

export function h() { return k().at(0); }

export const e = g().at(0);
