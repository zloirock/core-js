type Wrapper<T> = { inner: { value(): T } };
declare const w: Wrapper<string>;
w.inner.value().at(-1);
