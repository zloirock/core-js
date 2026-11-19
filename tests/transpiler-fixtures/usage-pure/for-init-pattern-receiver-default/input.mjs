// A consumed for initializer retains the nested receiver default and its statics.
let allSettled, i;
for (i = 0, { Promise: { allSettled } = {} } = (undefined || globalThis); i < 1; i++) use(allSettled);
