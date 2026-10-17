// The alias holds the container identity, so it observes the later slot replacement.
// Following that alias must consult the original container's writes before peeling.
const holder = { value: Object };
const alias = holder;
holder.value = Map;
export const { value: { groupBy } } = alias;
