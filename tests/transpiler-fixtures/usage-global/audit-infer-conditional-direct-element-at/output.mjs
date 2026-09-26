import "core-js/modules/es.string.at";
// infer-conditional whose true branch is the BARE element `U` (not `U[]`): the thread resolves U to
// the check's element type, so the member narrows to that element's methods - a string element
// resolves `.at` to es.string.at (not the array shape)
type D<T> = T extends Array<infer U> ? U : never;
declare const w: D<string[]>;
w.at(0);