// an ALIAS holding an undefinable nav keeps its `?.` LIVE (the runtime VALUE is the nav's,
// not the always-defined global the prefix walk sees) - the claim composes PLAIN into the
// single outer test
let navAlias;
navAlias = globalThis.window?.self.window;
export const viaAliasNavRead = navAlias?.Array.of(31).at(0);
