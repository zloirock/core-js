import "core-js/modules/es.array.at";
import "core-js/modules/es.function.name";
// A read outside the local function frame keeps its conservative type on repeated queries.
export function read(flag) {
  let value = [1];
  if (flag) value = [2];
  try {
    return value.at(-1);
  } catch (error) {
    return error.name;
  }
}