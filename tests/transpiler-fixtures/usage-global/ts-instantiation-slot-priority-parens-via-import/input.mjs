// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaImport = ((import('m'))<string>)(1);
