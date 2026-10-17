// `?.`-lowered input (a transpiler ran before this plugin): the optional chain arrives as a ternary whose
// TEST assigns a synthetic alias, and the read past the guard follows that write - plain, chained, in the
// strict spelling, window-valued, beside an effect or as a `??=` over a binding still unset, in any host -
// so claims and typed dispatch light up exactly like the unlowered spelling
var _g;
export const simple = (_g = globalThis) == null ? void 0 : _g.self.Set.name;
