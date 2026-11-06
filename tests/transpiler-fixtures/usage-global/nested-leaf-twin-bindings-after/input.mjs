// The nested leaf keeps its local bindings after extraction behind a residual.
const { config: { name, filters: { keys, values } = {} } } = APP_STATE;
use(() => [keys, values, name]);
