// The caller supplies explicit arguments. A default and its alias body use the declaration's names.
QUnit.test('TypeScript collection families across declaration scopes', assert => {
  interface Tagged { tag?: boolean }
  interface Rows extends Tagged, Array<number> {}
  function last(rows: Rows) { return rows.at(-1); }
  assert.same(last([4, 9]), 9);
  type Item = number[];
  type RowsOf<T = Item> = T;
  function read() {
    type Item = string;
    function fromDefault(rows: RowsOf) { return rows.at(0); }
    function fromArgument(rows: RowsOf<Item>) { return rows.at(0); }
    return [fromDefault([31]), fromArgument('rose')];
  }
  assert.deepEqual(read(), [31, 'r']);
});
