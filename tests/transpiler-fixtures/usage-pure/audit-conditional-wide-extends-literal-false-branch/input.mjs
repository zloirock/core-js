// `number extends 1` is FALSE per TS (a wide primitive does not extend a narrower literal of the
// same family), so the generic alias resolves to the false branch (string), not the true branch
type D<T> = T extends 1 ? number[] : string;
declare const w: D<number>;
w.at(0);
