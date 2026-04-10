interface Base<T> { data: T }
interface Container extends Base<string[]> { }

declare const c: Container;

c.data.at(-1);
