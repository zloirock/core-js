let q: any;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaPrefix = (++q)<string>(1);