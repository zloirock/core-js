{
// @ts-expect-error a spread argument tsc cannot place is the shape under test
const v = Object.freeze(...([[1, 2]] as any)); v.at(0);
}
