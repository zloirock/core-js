function use() { /* empty */ }
function raise() { /* empty */ }
try { raise(); } catch ({ c: { allSettled } = Promise }) { use(allSettled); }
