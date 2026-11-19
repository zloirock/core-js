export function viaCatch() {
  try {
    throw 0;
  } catch (Iterator) {
    {
      var Iterator = {
        range: () => 'c'
      };
    }
    return Iterator.range(0, 1);
  }
}