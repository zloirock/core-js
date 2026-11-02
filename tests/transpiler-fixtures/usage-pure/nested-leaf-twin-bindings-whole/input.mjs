// Replacing the whole nested pattern must not leave bindings on its old identifiers.
const { config: { items: { at, includes } = [] } } = APP_STATE;
use(() => [at, includes]);
