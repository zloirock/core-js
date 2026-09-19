// Opaque values require the declared member type. Array/string siblings expose a wrong-family helper.
QUnit.test('typed class members: getters, methods and fields keep their receiver family', assert => {
  class Box {
    #items: number[] = JSON.parse('[10,20]');
    static words: string = JSON.parse('"ab"');
    get items(): number[] { return this.#items; }
    get #word(): string { return JSON.parse('"cd"'); }
    set sink(value: string) {}
    list(): string[] { return JSON.parse('["x","y"]'); }
    readPrivate() { return [this.#items.at(-1), this.#word.at(-1)]; }
  }
  const box = new Box();
  assert.same(box.items.at(-1), 20);
  assert.deepEqual(box.readPrivate(), [20, 'd']);
  assert.same(box.list().at(-1), 'y');
  assert.same(Box.words.at(-1), 'b');
  assert.same(box.sink?.at(0), undefined, 'a setter-only property reads undefined');
  const object = { get word(): string { return JSON.parse('"ef"'); } };
  assert.same(object.word.at(-1), 'f');
});
