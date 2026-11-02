// Removing an empty spread keeps the constructor and the rest at their original positions.
export const [{ groupBy }, ...rest] = [...[], Map, Set];
