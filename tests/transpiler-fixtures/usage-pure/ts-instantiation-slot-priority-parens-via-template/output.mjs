// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaTemplate = `t`<any>(1);
export const r = [viaTemplate];