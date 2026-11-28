type Future<T> = { then(cb: (value: T) => unknown): unknown };
declare const future: Future<string>;
(await future).at(0);
export {};
