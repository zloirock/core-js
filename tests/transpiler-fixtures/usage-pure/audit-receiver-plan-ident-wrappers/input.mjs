// A computed-key effect runs after the destructuring receiver is evaluated and
// checked, even when wrappers hide a bare identifier. Quiet source names can be
// reused; a receiver prefix still runs once before the ordered extraction.
var { [(k1(), 'at')]: a, other } = arr as any;
var { [(k2(), 'flat')]: f, more } = (arr2);
// A prefix on the receiver runs once before the same ordered extraction.
var { [(k3(), 'includes')]: inc, rest } = (se1(), arr3) as any;
export const r = [a, f, inc, other, more, rest];
