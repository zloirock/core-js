const g: any = (x: number) => x;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaCall = ((g())<string>)(1);
