type R<T> = { val: T extends string ? T : never };

declare const r: R<string>;

r.val.at(-1);
