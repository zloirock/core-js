// A written slot no longer proves its receiver default will run.
let r;
const src = {};
src.list = [1, 2];
const { list: { entries } = Object } = src;
r = entries.call(src.list).next().value;
use(r);
