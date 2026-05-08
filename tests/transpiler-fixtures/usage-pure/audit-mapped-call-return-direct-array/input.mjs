// Identity mapped `Copy<string[]>` returns the array directly, with no nested member to peel.
// Call-return resolution must fold passthrough so `arr.at` narrows to the array polyfill.
type Copy<T> = { [K in keyof T]: T[K] };
declare function probe<T>(arg: T): Copy<T>;
const arr = probe<string[]>(null!);
arr.at(0);
