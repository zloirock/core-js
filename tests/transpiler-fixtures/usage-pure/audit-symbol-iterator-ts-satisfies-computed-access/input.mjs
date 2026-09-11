// `(Symbol satisfies unknown).iterator` - TS `satisfies` wrapper must be peeled
// so the inner `Symbol.iterator` is recognised and polyfilled
const iter = obj[(Symbol satisfies unknown).iterator];
