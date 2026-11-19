// The earlier claim and nested leaf share the computed root.
// The surviving nested binding is read after both method slots.
const { includes, data: { at: method, other: { value } } } = make();
use(includes, method, value);
