// an ALIAS holding an undefinable nav: the write stores the value canon (the guard
// conditional), the read classifies through its defined branch, keeps its `?.` LIVE (the
// runtime VALUE is the nav's, not the always-defined global the prefix walk sees) and the
// claim composes PLAIN into the single outer test
let navAlias;
navAlias = globalThis.window?.self.window;
export const viaAliasNavRead = navAlias?.Array.of(31).at(0);
