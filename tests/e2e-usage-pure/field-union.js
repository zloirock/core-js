QUnit.test(
  'field unions: object writes and nested extraction preserve substring dispatch',
  assert => {
    const box = { data: [10, 20] };
    assert.false(box.data.includes('02'));
    box.data = '1020';
    assert.true(box.data.includes('02'));
    const { data: { includes } } = box;
    assert.true(includes.call(box.data, '02'));
    const { data } = box;
    assert.true(data.includes('02'));
  },
);

QUnit.test(
  'field unions: initializer and write alternatives',
  assert => {
    for (const string of [false, true]) {
      const box = { data: string ? '1020' : [10, 20] };
      assert.same(box.data.includes('02'), string);
      box.data = string ? [10, 20] : '1020';
      assert.same(box.data.includes('02'), !string);
    }
  },
);

QUnit.test(
  'field unions: private and static writes preserve both families',
  assert => {
    class Box {
      #data = [10, 20];
      static data = [10, 20];
      static { this.data = '1020'; }
      change() { this.#data = '1020'; }
      read() { return this.#data.includes('02'); }
      static read() { return this.data.includes('02'); }
    }
    const box = new Box();
    assert.false(box.read());
    box.change();
    assert.true(box.read());
    assert.true(Box.read());
  },
);

QUnit.test(
  'field unions: method slots can hold non-function values',
  assert => {
    const object = { data() { return 1; } };
    object.data = [10, 20];
    assert.true(object.data.includes(20));
    class Box {
      data() { return 1; }
      static data() { return 1; }
    }
    const box = new Box();
    box.data = '1020';
    assert.true(box.data.includes('02'));
    Box.data = [10, 20];
    assert.true(Box.data.includes(20));
    const arrow = { data: () => 1 };
    arrow.data = '1020';
    assert.true(arrow.data.includes('02'));
  },
);

QUnit.test(
  'field unions: function initializers and assignment extraction',
  assert => {
    // eslint-disable-next-line object-shorthand -- exercise a function-valued data property
    const box = { data: function () { return 1; } };
    box.data = '1020';
    assert.true(box.data.includes('02'));
    class Box {
      data = function () { return 1; };
      static data = function () { return 1; };
    }
    const instance = new Box();
    instance.data = [10, 20];
    assert.false(instance.data.includes('02'));
    Box.data = '1020';
    let value = Math;
    assert.same(typeof value, 'object');
    ({ data: value } = Box);
    assert.true(value.includes('02'));
    const chars = { data: Math };
    chars.data = '1020';
    ({ data: value } = chars);
    assert.true(value.includes('02'));
  },
);

QUnit.test(
  'field unions: a replacement method can hand its receiver to another writer',
  assert => {
    function change(value) { value.data = '1020'; }
    const object = { data: [10, 20], change() { return 1; } };
    object.change = function () { change(this); };
    object.change();
    assert.true(object.data.includes('02'));
    class Box {
      data = [10, 20];
      static data = [10, 20];
      change() { return 1; }
      static change() { return 1; }
    }
    const box = new Box();
    box.change = function () { change(this); };
    box.change();
    assert.true(box.data.includes('02'));
    Box.change = function () { change(this); };
    Box.change();
    assert.true(Box.data.includes('02'));
  },
);

QUnit.test(
  'field unions: a nested call can change the family after a guard',
  assert => {
    let value = 'hello';
    function mutate() { value = [42]; }
    if (typeof value === 'string') {
      mutate();
      assert.same(value.at(0), 42);
    }
  },
);

QUnit.test(
  'field unions: assignment defaults contribute another family',
  assert => {
    for (const flag of [false, true]) {
      const box = { data: flag ? [10, 20] : undefined };
      let data = Math;
      ({ data = '1020' } = box);
      function read() { return data.includes('02'); }
      assert.same(read(), !flag);
    }
  },
);

QUnit.test(
  'field unions: unknown method writes invalidate callable assumptions',
  assert => {
    const object = { data() { return 1; } };
    const alias = assert ? object : {};
    alias.data = '1020';
    assert.true(object.data.includes('02'));
    class Box {
      data() { return 1; }
      static data() { return 1; }
    }
    const box = new Box();
    const key = 'data';
    box[key] = '1020';
    assert.true(box.data.includes('02'));
    Box.change = function () { this.data = '1020'; };
    Box.change();
    assert.true(Box.data.includes('02'));
  },
);

QUnit.test(
  'field unions: unread bodies installed and called through aliases',
  assert => {
    function change(value) { value.data = '1020'; }
    function fn() { change(this); }
    const box = { data: [10, 20] };
    const alias = box;
    alias.change = fn;
    box.change();
    assert.true(box.data.includes('02'));
    class Box {
      constructor() { new.target.change(); }
      data = [10, 20];
      change() { return 1; }
      static data = [10, 20];
      static change() { return 1; }
    }
    const instance = new Box();
    instance.change = fn;
    instance.change();
    assert.true(instance.data.includes('02'));
    Box.change = fn;
    Box.change();
    assert.true(Box.data.includes('02'));
    Box.data = [10, 20];
    new Box();
    assert.true(Box.data.includes('02'));
  },
);
