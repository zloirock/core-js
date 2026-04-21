// Awaited<T> with nested Promise alias. plugin calls `unwrapPromise` which only
// works on $Object('Promise', inner). With explicit TS Awaited<Promise<Promise<string[]>>>
// expect deep unwrap to string[].
type Deep = Awaited<Promise<Promise<string[]>>>;
declare const d: Deep;
d.at(0);
d.includes('x');
