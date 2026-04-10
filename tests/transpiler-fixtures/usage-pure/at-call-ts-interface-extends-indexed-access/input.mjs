type Config = { items: string[] };
interface Base<T> { val: T["items"] }
interface Child extends Base<Config> {}
declare const c: Child;
c.val.at(-1);
