// A const-bound nested array-wrapper alias (`[{ a: Array }]`) is followed through to resolve the
// static method's receiver, so usage-global injects the polyfill
const wrapper = [{ a: Array }];
const [{ a: { from } }] = wrapper;
from([1]);
