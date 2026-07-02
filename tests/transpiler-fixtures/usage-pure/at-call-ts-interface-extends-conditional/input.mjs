interface Base<T> { val: T extends string ? T : never }
interface Child extends Base<string> {}
declare const c: Child;
c.val.at(-1);
