// Record<K, V> member access - utility-type member lookup synthesizes an index signature
// returning V. `rec.anything.at` resolves with the V-typed receiver, so V = string[]
// routes to the Array.at instance polyfill.
declare const rec: Record<string, string[]>;
rec.foo.at(0);
rec.bar.includes('x');
