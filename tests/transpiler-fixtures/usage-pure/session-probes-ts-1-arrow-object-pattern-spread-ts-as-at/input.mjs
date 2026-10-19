{
// @ts-expect-error a spread argument tsc cannot place is the shape under test
const r = (({ at }) => at)(...([[1, 2]] as any));
}
