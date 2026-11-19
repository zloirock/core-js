// A consumed field initializer preserves the source value and the nested default's static.
let allSettled;
class C { field = ({ Promise: { allSettled } = {} } = (undefined || globalThis)); }
new C();
use(allSettled);
