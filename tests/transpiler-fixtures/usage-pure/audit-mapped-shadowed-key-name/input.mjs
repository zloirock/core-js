// Outer alias type-param `K` shadowed by mapped-type's inner `K` binding. When the alias
// chain folds outer-K substitution into the mapped body, capture would replace the inner-
// bound K references with the outer K substitute. Each method probes a different field type
// so per-key dispatch is observable in the emitted imports.
type Wrap<K> = { [K in keyof { items: number[]; name: string[] }]: { items: number[]; name: string[] }[K] };
declare const r: Wrap<symbol>;
r.items.at(0);
r.name.includes('foo');
