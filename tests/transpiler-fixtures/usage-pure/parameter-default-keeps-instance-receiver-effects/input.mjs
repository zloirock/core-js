const events = [];
const array = [3, [1, 2]];
function read({ at } = (events.push('default'), array).flat()) { return at.call(array, -1); }
use(read(), events);
