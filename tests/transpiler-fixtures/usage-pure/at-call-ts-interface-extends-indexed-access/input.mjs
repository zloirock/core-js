type Config = { items: string[] };
// @ts-expect-error an index into a type parameter tsc cannot key is the shape under test
interface Base<T> { val: T["items"] }
interface Child extends Base<Config> {}
declare const c: Child;
c.val.at(-1);
