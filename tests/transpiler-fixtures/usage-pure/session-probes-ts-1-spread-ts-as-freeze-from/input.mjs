{
// @ts-expect-error a spread argument tsc cannot place is the shape under test
const v = Object.freeze(...([Array] as any)); v.from([]);
}
