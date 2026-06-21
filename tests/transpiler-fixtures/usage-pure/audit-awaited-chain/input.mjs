// Awaited<T> over a nested Promise alias: explicit `Awaited<Promise<Promise<string[]>>>`
// must deep-unwrap each Promise layer down to string[], so `at` / `includes` emit the
// array-specific helpers.
type Deep = Awaited<Promise<Promise<string[]>>>;
declare const d: Deep;
d.at(0);
d.includes('x');
