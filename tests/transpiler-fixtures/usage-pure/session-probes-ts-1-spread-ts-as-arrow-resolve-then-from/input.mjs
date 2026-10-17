{
const v = Promise.resolve(...([Array] as any)); v.then(A => A.from([]));
}
