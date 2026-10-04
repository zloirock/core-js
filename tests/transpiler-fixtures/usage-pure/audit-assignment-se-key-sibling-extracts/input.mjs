// All assignment slots share the captured receiver and keep their key/write order.
// Receiver effects run once, before the first static binding; bound keys keep their claims.
const log = [];
const K = 'of';
let a, b, c, d, e, f, g, h, held;
({ of: b, [(log.push('k1'), 'from')]: a } = (log.push('recv'), Array));
({ [(log.push('k2'), 'from')]: c, [(log.push('k3'), 'of')]: d } = Array);
({ [(log.push('k4'), 'from')]: e, of: f } = (held = Map, Array));
({ [(log.push('k5'), 'from')]: g, [K]: h } = Array);
export const r = [typeof a, typeof b, typeof c, typeof d, typeof e, typeof f, typeof g, typeof h, typeof held, log.join(',')];
