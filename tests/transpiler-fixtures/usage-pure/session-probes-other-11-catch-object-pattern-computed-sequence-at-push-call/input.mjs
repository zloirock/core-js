export const log = [];
function eff(key) { log.push(key); return Object; }
try { throw { w: [1] }; } catch ({ [(eff('k'), 'w')]: { at: a } }) { log.push(a.call([5], 0)); }
