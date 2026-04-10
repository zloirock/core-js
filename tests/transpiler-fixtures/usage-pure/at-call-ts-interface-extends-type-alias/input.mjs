type W<T> = { val: T };
interface I extends W<string[]> {}
declare const i: I;
i.val.at(-1);
