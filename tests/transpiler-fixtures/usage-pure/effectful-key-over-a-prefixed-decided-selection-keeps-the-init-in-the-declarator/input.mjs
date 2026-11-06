// an effectful computed key over a selection the build decides, behind an effect prefix: the selection
// reads as the operand that runs, so the key's route keeps the init - its prefix included - in the
// declarator, as for that operand spelled alone
const { [(k(), 'groupBy')]: groupBy } = (eff(), typeof Symbol != 'undefined' ? Map : Object);
let { [(k(), 'from')]: from } = (eff(), typeof Symbol != 'undefined' && Array);
export const { [(k(), 'withResolvers')]: withResolvers } = (eff(), Promise || Object);
const head = 1, { [(k(), 'of')]: of } = (eff(), Array ?? Object);
export { groupBy, from, head, of };
