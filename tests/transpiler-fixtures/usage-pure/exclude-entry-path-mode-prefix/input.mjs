[].at(0);
[].includes(1);
// an EXCLUDED entry behind an SE-computed key degrades whole: no extraction, no orphaned
// trailing pair - the destructure (and its key effect) stays native
let k = 0;
var { [(k++, 'at')]: viaKey } = [7], reader = viaKey;
console.log(typeof reader, k);
