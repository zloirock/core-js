class C<T> { *g<T>(x: T): Generator<T> { yield x; } }
for (const x of new C<number[]>().g("abc")) x.at(0);

export {};
