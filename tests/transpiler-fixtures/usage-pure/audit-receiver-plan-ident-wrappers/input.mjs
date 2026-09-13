// A computed-key effect runs after the destructuring receiver is evaluated and
// checked, even when wrappers hide a bare identifier. The receiver is held once so
// a key effect cannot redirect a later read by reassigning that identifier.
var { [(k1(), 'at')]: a, other } = arr as any;
var { [(k2(), 'flat')]: f, more } = (arr2);
// A prefix on the receiver runs once before the same ordered extraction.
var { [(k3(), 'includes')]: inc, rest } = (se1(), arr3) as any;
export const r = [a, f, inc, other, more, rest];
