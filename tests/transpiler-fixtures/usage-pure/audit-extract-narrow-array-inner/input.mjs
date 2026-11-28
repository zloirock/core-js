// The retained array contains strings; skipping Extract also admits an array element.
type Narrowed = Extract<string[][] | string[], string[]>;
declare const arr: Narrowed;
export const first = arr[0].at(0);
export const has = arr.includes('a');
