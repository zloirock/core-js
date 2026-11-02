// A nested default keeps its guard local to the relocated catch body.
// A sibling extraction must not discard that guard declaration.
try { throw getPlugin(); }
catch ({ at: { name } = { name: 'fallback' }, meta: { includes } }) { use(name, includes); }
