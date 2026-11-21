export function lexical() {
  try {
    (({ from } = Array) => from([4]))(undefined);
    let undefined;
  } catch (error) {
    return error.name;
  }
}
