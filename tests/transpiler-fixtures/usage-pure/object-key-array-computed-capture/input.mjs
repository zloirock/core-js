// A proven computed key stays native before the selected array is destructured.
// Its effect runs once after the initializer; exports expose only the source binding.
const key = 'items';
const { [key]: [{ at }] } = { items: [[2, 7]] };
export const { [(mark(), 'items')]: [{ includes }] } = { items: ['abc'] };
use(at);
let startsWith;
({ [(mark(), 'items')]: [{ startsWith }] } = { items: ['abc'] });
use(startsWith);
