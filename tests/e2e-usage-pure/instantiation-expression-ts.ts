// The `expr<T>` type-instantiation slot takes a LeftHandSideExpression, so every looser shape
// reaches it wrapped in source parens. The AST emitter reprints that slot, and a reprint that
// drops the parens re-associates the call - into the arrow body, the ternary alternate, the
// awaited operand, the optional chain - or turns the type arguments into a relational chain.
// The observable is the CALL: which function ran, on which value, and whether it ran at all.

QUnit.test('instantiation-ts: arrow in the slot keeps the call outside its body', assert => {
  const inner = (n: number) => [n, [2]].flat();
  const result = ((() => inner)<string>)()(1);
  assert.deepEqual(result, [1, 2]);
  assert.true(Array.isArray(result), 'a dropped paren makes the whole line an arrow instead');
});

QUnit.test('instantiation-ts: conditional in the slot calls the picked branch', assert => {
  const consequent = (n: number) => [n, [2]].flat();
  const alternate = () => 'alternate';
  assert.deepEqual(((true ? consequent : alternate)<string>)(1), [1, 2]);
});

QUnit.test('instantiation-ts: assignment in the slot assigns the callee, not the result', assert => {
  const target = (n: number) => [n, [2]].flat();
  let slot: unknown;
  const result = ((slot = target)<string>)(1);
  assert.deepEqual(result, [1, 2]);
  assert.same(slot, target, 'the assignment stores the function, the call happens above it');
});

QUnit.test('instantiation-ts: logical in the slot calls the chosen operand', assert => {
  const left = (n: number) => [n, [3]].flat();
  const right = () => 'right';
  assert.deepEqual(((left || right)<string>)(1), [1, 3]);
});

QUnit.test('instantiation-ts: awaited value in the slot is the callee', async assert => {
  const done = assert.async();
  const target = (n: number) => [n, [2]].flat();
  const result = ((await Promise.resolve(target))<string>)(1);
  assert.deepEqual(result, [1, 2], 'a dropped paren awaits the CALL of the unresolved promise');
  done();
});

QUnit.test('instantiation-ts: yielded value in the slot is the callee', assert => {
  function* run() {
    const sent = ((yield 'ask')<string>)(1);
    return sent;
  }
  const iterator = run();
  assert.same(iterator.next().value, 'ask', 'the yield hands out its own operand, uncalled');
  assert.deepEqual(iterator.next((n: number) => [n, [2]].flat()).value, [1, 2]);
});

// a paren-terminated optional chain is a VALUE, so the call above it runs unconditionally and
// throws on a nullish head; letting the chain swallow the call would short-circuit to undefined
QUnit.test('instantiation-ts: optional chain in the slot does not swallow the call', assert => {
  const head: { member?: () => unknown } | null = null;
  assert.throws(() => ((head?.member)<string>)(1), TypeError);
  assert.throws(() => ((head?.())<string>)(1), TypeError);
});

// operator results are never callable, so the correct reading always throws - the dropped-paren
// reading calls the right operand instead and returns a value
QUnit.test('instantiation-ts: operator results in the slot are called, not their operands', assert => {
  const operand = (n: number) => [n, [2]].flat();
  assert.throws(() => (((['x'].at(0) as string) + operand)<string>)(1), TypeError);
  assert.throws(() => ((void operand)<string>)(1), TypeError);
  let counter = 0;
  assert.throws(() => ((counter++)<string>)(1), TypeError);
  assert.same(counter, 1, 'the update still ran once, as its own operand');
});

// the polyfilled statics are substituted UNDER the restored parens - the slot is read while the
// ponyfill binding is still landing in it
QUnit.test('instantiation-ts: ponyfill substitution under the restored parens', assert => {
  const truthy = () => 'truthy';
  assert.deepEqual(((truthy ? Array.from : truthy)<never>)([1, [2]]), [1, [2]]);
  let slot: unknown;
  assert.deepEqual(((slot = Array.of)<never>)(1), [1]);
  assert.same(typeof slot, 'function', 'the assignment stored the static itself');
});

// a member tail refuses a BARE instantiation - `(holder<T>).m` is the only way the shape can be
// written, so an emitter that reprints it bare produces source that does not parse at all
QUnit.test('instantiation-ts: member tail keeps the instantiation parenthesized', assert => {
  const holder = { member: (n: number) => [n, [2]].flat() };
  const list = [(n: number) => [n, [3]].flat()];
  assert.deepEqual((holder<never>).member(1), [1, 2]);
  assert.deepEqual((list<never>)[0](1), [1, 3]);
  assert.deepEqual((holder<never>)?.member(1), [1, 2]);
  assert.deepEqual(((holder as never)<never>).member(1), [1, 2]);
});

// handing the type arguments to the host above re-parents the operand, and a member tail wraps the
// whole instantiation - neither may move an evaluation or detach a receiver
QUnit.test('instantiation-ts: re-parenting keeps side-effect order and the receiver', assert => {
  const log: string[] = [];
  const mark = (tag: string) => { log.push(tag); return tag; };
  const holder = { tag: 'holder', member(...args: unknown[]) { return [this && this.tag, ...args]; } };

  assert.deepEqual(((mark('operand'), holder)<never>).member(mark('argument')),
    ['holder', 'argument'], 'the member tail keeps `this`, and both effects run');
  assert.deepEqual(log, ['operand', 'argument'], 'operand before argument, each exactly once');

  assert.deepEqual(((holder.member)<never>)(1), ['holder', 1], 'a folded member callee keeps its receiver');
  assert.deepEqual(((holder.member as never)<never>)(1), ['holder', 1], 'and keeps it through a cast');
  // the OPTIONAL-call twin of these is asserted by the fixtures instead: an instantiation left in
  // front of `?.` is invisible to the lowering that memoizes the receiver, and in the post phase
  // that lowering has already run by the time this plugin sees the file - nothing downstream of it
  // can put the receiver back, so the runtime oracle cannot hold on every leg

  let counter = 0;
  assert.throws(() => ((counter++)<never>)(1), TypeError);
  assert.same(counter, 1, 'a re-parented update operand still runs exactly once');
});

// the compensating paren is a node only the generator understands, so it goes in after every
// lowering has run. these shapes are the proof: each holds an `await` inside a slot that still owes
// its parens, and this bundle lowers to ES5 - an early paren here does not fail an assertion, it
// aborts the build, so the file compiling at all is half the lock and the values are the other half
QUnit.test('instantiation-ts: parens owed inside an awaited slot survive the lowering', async assert => {
  const done = assert.async();
  const target = (n: number) => [n, [2]].flat();
  const holder = { member: target };

  assert.deepEqual((((await Promise.resolve(target)) as never)<never>)(1), [1, 2]);
  assert.deepEqual((((await Promise.resolve(holder))<never>).member)(1), [1, 2]);
  let counter = 0;
  assert.same(typeof ((counter++)<never>), 'number', 'a fusing operand keeps its parens too');
  assert.same(counter, 1);
  done();
});

// negatives: the shapes the slot accepts bare must keep working untouched
QUnit.test('instantiation-ts: slot-legal shapes stay bare', assert => {
  const target = (n: number) => [n, [2]].flat();
  const holder = { member: target };
  let counter = 0;
  assert.deepEqual(((target)<string>)(1), [1, 2]);
  assert.deepEqual(((holder.member)<string>)(1), [1, 2]);
  assert.deepEqual(((holder.member!)<string>)(1), [1, 2]);
  assert.deepEqual(((counter++, target)<string>)(1), [1, 2]);
  assert.same(counter, 1);
  assert.deepEqual(((Array.from as never)<never>)([1, [2]]), [1, [2]]);
});
