// `Iterator.from(arr).toAsync()` lifts a sync iterator to async; subsequent .map / .toArray
// on the async chain use AsyncIterator-helper polyfills. Distinct from the AsyncIterator.from
// route - here the source is sync and the toAsync hop carries the type transition
Iterator.from(arr).toAsync().map(asyncFn).toArray();
