// an effectful-key read over a selection the build decides behind an effect prefix: the receiver is
// the value the selection yields, proven defined as that value spelled alone is, so no nullish test
// stands ahead of the read
const { [(k(), 'groupBy')]: groupBy } = (eff(), typeof Symbol != 'undefined' && Map);
const { [(k(), 'at')]: at } = (eff(), typeof Symbol != 'undefined' ? [1] : user);
var flat;
({ [(k(), 'flat')]: flat } = (eff(), typeof Symbol != 'undefined' && [2]));
export { groupBy, at, flat };
