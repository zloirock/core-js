// NEGATIVE: a write inside a HOISTED closure called before the capture may run before the
// read - a textual after-position proves nothing across the function boundary, so bail
let kh = 'Symbol';
flipKey();
function flipKey() { kh = 'Array'; }
