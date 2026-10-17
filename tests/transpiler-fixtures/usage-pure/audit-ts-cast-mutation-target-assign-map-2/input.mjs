// ... including the patch that travels through an ALIAS of the container, which the escape census
// follows and a per-name walk of the calls alone would miss
enum Aliased { MAP = 'map' }
const aliasOfEnum = Aliased;
Object.assign(aliasOfEnum, { MAP: 'filter' });
