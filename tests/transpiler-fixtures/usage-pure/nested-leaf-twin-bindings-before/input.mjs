// The nested leaf keeps its local bindings after extraction before a residual.
const { config: { items: { at, includes } = [], name } } = APP_STATE;
use(() => [at, includes, name]);
