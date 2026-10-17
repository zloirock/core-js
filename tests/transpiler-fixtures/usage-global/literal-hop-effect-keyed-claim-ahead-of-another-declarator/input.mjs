// A literal hop whose level holds an effect-keyed instance claim beside a nested pattern, in a `var` followed by
// another declarator: the residual keeps the key where the source wrote it, the claim reads the literal's slot
// through a memo after it, and the next declarator's claim follows - alike in both legs.
var { y: { last: { t }, [(e(), 'fill')]: cc } } = { y: [1] }, { at: g } = arr;
export { t, cc, g };
