// A BigInt default and computed key survive moving a loop pattern into its body.
for (const { at, limit = 10n, [1n]: first } of rows) use(at, limit, first);
