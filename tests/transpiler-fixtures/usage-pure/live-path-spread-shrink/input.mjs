// An empty spread stays written while later constructor slots are rewritten.
export const [{ groupBy }, ...rest] = [...[], Map, Set];
