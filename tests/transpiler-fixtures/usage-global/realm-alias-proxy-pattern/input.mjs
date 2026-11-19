// A leading realm hop is peeled before extracting instance methods from an alias.
const realm = globalThis;
const { globalThis: { Array: { prototype: { at, includes } } } } = realm;
export { at, includes };
