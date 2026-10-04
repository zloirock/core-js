// The receiver runs before the first static write; the next key observes that write.
const events = [];
let from, of = 'old';
({ of, [(events.push(['key', typeof of]), 'from')]: from } = (events.push(['rhs', of]), Array));
use(from([7]), of(8), events);
