{
// @ts-expect-error a spread argument tsc cannot place is the shape under test
const v = Promise.resolve(...([Array] as any)); v.then(A => A.from([]));
}
