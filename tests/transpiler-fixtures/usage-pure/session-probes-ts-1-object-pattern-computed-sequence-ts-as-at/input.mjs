function eff(key) { return Object; }
{
// @ts-expect-error a computed key tsc refuses is the shape under test
const { [(eff('k'), 'w' as string)]: { at: a } } = { w: src };
}
