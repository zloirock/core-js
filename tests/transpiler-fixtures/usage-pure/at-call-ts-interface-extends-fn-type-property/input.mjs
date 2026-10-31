interface Base<T> { fn: () => T }
interface Child extends Base<string[]> {}
declare const c: Child;
c.fn().at(-1);
