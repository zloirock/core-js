// A module-local interface outranks a same-named built-in synonym.
// Its declared String heritage requires String instance dispatch.
export {};
interface PromiseLike<T> extends String {}
export function read(value: PromiseLike<number>) { return value.at(0); }
