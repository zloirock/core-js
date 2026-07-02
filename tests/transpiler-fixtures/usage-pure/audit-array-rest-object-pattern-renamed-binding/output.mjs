// renamed binding in ObjectPattern-in-rest: `[first, ...{ length: rest }]` - the rest
// slice's `length` property aliases to local `rest`. tests that findArrayPatternKeyPath
// resolves both the ObjectPattern branch AND the alias-rename via findDestructuredKeyPath
const arr = [1, 2, 3, 4];
const [first, ...{
  length: rest
}] = arr;
export { first, rest };