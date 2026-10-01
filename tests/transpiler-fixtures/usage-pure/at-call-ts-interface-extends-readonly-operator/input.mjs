interface Base<T> { items: readonly T[] }
interface Child extends Base<string> {}
declare const c: Child;
c.items.at(-1);
