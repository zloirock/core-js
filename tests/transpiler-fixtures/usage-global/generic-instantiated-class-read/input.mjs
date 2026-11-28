class Holder<T = string> { get(): T { return null as any; } }
declare const resolved: Holder<number[]>;
resolved.get().includes(2);
