// usage-global twin of the usage-pure array-wrapper-aliased-leaf-static fixture: the const-alias leaf
// (`const A = Array; const [{ from }] = [A]`) must resolve to Array so `es.array.from` is injected.
// regression: the raw-name-only Identifier leaf branch dropped the dependency for the alias in both plugins
const A = Array;
const [{ from }] = [A];
from([1, 2]);
