// Symbol.X inside a computed Symbol.X probe: `obj[Symbol[Symbol.iterator]] in x`.
// resolveKey's `Symbol.X computed` branch forks `seen` per side (A5) so the shared
// Symbol binding visited on the outer MemberExpression object doesn't trip the cycle
// guard when resolveKey descends into the inner `Symbol.iterator` for the same Set.
// asSymbolRef also propagates `seen` through `resolvesToGlobalSymbol` (A4) for
// symmetric cycle-safety across the binding/global cycle path
obj[Symbol[Symbol.iterator]] in x;
