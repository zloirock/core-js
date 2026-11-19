// A nested head reads the factory result, even though the declaration has no initializer.
const make = () => ({ data: opts || defaults });
for (const { data: { includes } } of [make()]) use(includes);
