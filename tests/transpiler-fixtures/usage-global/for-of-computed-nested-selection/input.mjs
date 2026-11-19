// Computed nested navigation reads the loop element without an initializer path.
for (const { ['data']: { includes } } of [{ data: flag ? rows : other }]) use(includes);
