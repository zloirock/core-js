type Cfg = { data: string[] };
interface Base<T> { fn: () => T["data"]; cond: T extends Cfg ? T["data"] : never }
interface Child extends Base<Cfg> {}
declare const c: Child;
c.fn().at(-1);
c.cond.at(-1);
