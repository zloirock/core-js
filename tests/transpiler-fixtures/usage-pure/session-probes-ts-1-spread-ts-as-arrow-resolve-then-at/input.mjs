{
// @ts-expect-error a spread argument tsc cannot place is the shape under test
const v = Promise.resolve(...([[1, 2]] as any)); v.then(a => a.at(0));
}
