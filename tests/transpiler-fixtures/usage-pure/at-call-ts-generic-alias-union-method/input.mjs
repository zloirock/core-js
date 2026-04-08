type Wrapper<T> = { kind: 'a'; get(): T } | { kind: 'b'; get(): T };
declare const w: Wrapper<string[]>;
w.get().at(0);
