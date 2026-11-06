// Distinct returned constructors cannot prove one receiver. Preserve the call and guard
// a possible static by its actual identity; prototype reads keep their native lookup.
const arrFrom = (() => { return Array; return Set; })().from([1]);
const setIntersect = (() => { return Set; return Array; })().prototype.intersection;
export { arrFrom, setIntersect };
