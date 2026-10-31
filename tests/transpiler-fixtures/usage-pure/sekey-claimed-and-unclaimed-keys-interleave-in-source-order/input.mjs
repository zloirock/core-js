// claimed and unclaimed effectful keys over one literal interleave in source order - key, read, key, read
// - and a sibling property after an instance claim is read only after its dispatch
let k = 0;
var { [(k++, 'of')]: o7, [(k++, 'at')]: a7, m7b } = [1];
var { [(k++, 'at')]: a8, m8b, [(k++, 'of')]: o8 } = [1];
export default [o7, a7, m7b, a8, m8b, o8, k];
