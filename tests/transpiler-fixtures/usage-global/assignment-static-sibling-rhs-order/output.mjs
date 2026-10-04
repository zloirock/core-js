import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
// The receiver runs before the first static write; the next key observes that write.
const events = [];
let from,
  of = 'old';
({
  of,
  [(events.push(['key', typeof of]), 'from')]: from
} = (events.push(['rhs', of]), Array));
use(from([7]), of(8), events);