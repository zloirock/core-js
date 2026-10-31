type Cfg = { data: string[] };
// @ts-expect-error an index into a type parameter tsc cannot key is the shape under test
interface Base<T> { fn: () => T["data"]; cond: T extends Cfg ? T["data"] : never }
interface Child extends Base<Cfg> {}
declare const c: Child;
c.fn().at(-1);
c.cond.at(-1);
