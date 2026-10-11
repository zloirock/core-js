// a static read through a container a decided selection yields, in an assignment whose value is used,
// takes the slot default its plain twin takes: off a ternary, an `&&`, and a `||` whose left is a fresh
// object
let attempt, groupBy, from;
export const viaTernary = () => ({ C: { try: attempt } } = typeof Symbol != 'undefined' ? { C: Promise } : { C: Object });
export const viaAnd = () => ({ C: { groupBy } } = typeof Symbol != 'undefined' && { C: Map });
export const viaOr = () => ({ C: { from } } = { C: Iterator } || { C: Object });
export { attempt, groupBy, from };
