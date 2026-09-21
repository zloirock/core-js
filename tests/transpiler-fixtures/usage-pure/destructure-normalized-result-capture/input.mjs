// A lowered result capture keeps the original receiver beside its extracted statics.
let of, from, saved;
function get() { log('get'); return Array; }
const held = (({ of, from } = (saved = get())), saved);
use(held, of(1), from([2]));
