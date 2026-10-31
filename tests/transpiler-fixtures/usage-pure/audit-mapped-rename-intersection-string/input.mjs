// evalRenameTemplate handles `string & K` intersection (drops the string-keyword
// half, evaluates the rest). Verify that with a real source where K is the type
// param: members preserve their names through the intersection rename.
type Brand<T> = { [K in keyof T as string & K]: T[K] };
declare const r: Brand<{ items: number[]; name: string }>;
r.items.at(0);
r.name.includes('a');
