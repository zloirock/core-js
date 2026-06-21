// single-quasi TemplateLiteral arg (`` `a` ``). the string / numeric literal checks miss,
// so the cooked text of the single quasi must be recovered for the rewrite to still produce
// `Items['a']` (parity with the type side, where ``T[`a`]`` template indexing is recognised
// the same way)
type Items = { a: string[]; b: number[] };
declare function pick<K extends keyof Items>(k: K): Items[K];
pick(`a`).at(0);
