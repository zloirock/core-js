interface Base<T> { fn: (x: T) => T }
interface Child extends Base<string> {}
declare const c: Child;
c.fn("a").at(-1);
