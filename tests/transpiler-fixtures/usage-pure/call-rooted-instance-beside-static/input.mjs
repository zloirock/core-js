// A known realm result supplies both the nested instance read and its sibling.
const get = () => globalThis;
const { Array: { prototype: { flat }, isArray } } = get();
export { flat, isArray };
