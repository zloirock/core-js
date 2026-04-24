// Record<K, V> member access - getTypeMembers synthesizes a TSIndexSignature with V.
// Plugin should resolve `rec.anything.at` to V-typed receiver. V = string[], so Array.at.
declare const rec: Record<string, string[]>;
rec.foo.at(0);
rec.bar.includes('x');
