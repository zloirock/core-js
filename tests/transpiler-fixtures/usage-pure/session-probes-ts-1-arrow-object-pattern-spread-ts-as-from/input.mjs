{
// @ts-expect-error a spread argument tsc cannot place is the shape under test
const r = (({ from }) => from)(...([Array] as any));
}
