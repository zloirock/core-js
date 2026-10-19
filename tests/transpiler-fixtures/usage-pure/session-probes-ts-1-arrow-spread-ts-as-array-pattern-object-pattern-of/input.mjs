{
// @ts-expect-error a spread argument tsc cannot place is the shape under test
const r = ((a: any) => a)(...([Array] as any)); const [{ of: o }] = [...([Array])];
}
