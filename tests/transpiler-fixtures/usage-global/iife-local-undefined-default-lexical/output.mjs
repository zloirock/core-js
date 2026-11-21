import "core-js/modules/es.function.name";
export function lexical() {
  try {
    (({
      from
    } = Array) => from([4]))(undefined);
    let undefined;
  } catch (error) {
    return error.name;
  }
}