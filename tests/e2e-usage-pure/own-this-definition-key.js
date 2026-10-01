QUnit.test('nested definition keys can expose the enclosing receiver', assert => {
  const sink = Function('value', 'value.rows = "abc"; return "key";');
  const object = {
    rows: [1, 2],
    touch() { return { [sink(this)]() { /* empty */ } }; },
  };
  object.touch();
  assert.same(object.rows.at(-1), 'c');
  // eslint-disable-next-line unicorn/no-static-only-class -- the static receiver is the regression surface
  class Holder {
    static rows = [1, 2];
    static touch() {
      return class {
        [(() => {
          const self = this;
          return sink(self);
        })()] = 1;
      };
    }
  }
  Holder.touch();
  assert.same(Holder.rows.at(-1), 'c');
});

QUnit.test('nested field values and static blocks own another receiver', assert => {
  const sink = Function('value', 'value.rows = "abc";');
  const object = {
    rows: [1, 2],
    touch() {
      return new class {
        static { sink(this); }
        hook = sink(this);
      }();
    },
  };
  object.touch();
  assert.same(object.rows.at(-1), 2);
});

QUnit.test('method parameters can write the receiver before its body runs', assert => {
  const object = {
    rows: [1, 2],
    touch({ [this.rows = 'abc']: value } = {}) { return value; },
  };
  object.touch();
  assert.same(object.rows.at(-1), 'c');
});
