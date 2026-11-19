// an effectful-key pattern written over a selection the build decides behind an effect prefix plans
// over the value the selection yields: the static is read off the constructor that runs, as for that
// constructor spelled alone - in an assignment's value, a statement and a declaration with a rest
var groupBy, other, from, of;
export const grouped = () => ({ [(k(), 'groupBy')]: groupBy, other } = (eff(), typeof Symbol != 'undefined' && Map));
export const listed = () => ({ [(k(), 'from')]: from } = (eff(), typeof Symbol != 'undefined' ? Array : Object));
({ [(k(), 'of')]: of, other } = (eff(), Array || Object));
const { [(k(), 'withResolvers')]: withResolvers, ...others } = (eff(), Promise ?? Object);
export { withResolvers, others };
