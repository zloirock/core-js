interface Base<T> { val: T extends number ? never : T }
interface Child extends Base<string> {}
declare const c: Child;
c.val.at(-1);
