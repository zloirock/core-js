{
// @ts-expect-error a computed key tsc refuses is the shape under test
const { ['w' as string]: { at: a } } = { w: src };
}
