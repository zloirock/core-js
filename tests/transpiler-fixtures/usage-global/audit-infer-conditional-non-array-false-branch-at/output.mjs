import "core-js/modules/es.string.at";
// non-array check takes the FALSE branch (`number` does not extend Array<infer U>): the element
// thread is gated on an array-shaped check, so it does not fire; the false branch (`string`)
// resolves and `.at` narrows to es.string.at
type F<T> = T extends Array<infer U> ? U[] : string;
declare const v: F<number>;
v.at(0);