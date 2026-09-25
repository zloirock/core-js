import { restoreProperty } from '../../helpers/restore-property.cjs';

// A static patched THROUGH a slot of the container an invocation yields - an inline callee filling
// the slot from a parameter, a `new`, a destructured slot of a `new` or of an `await` - is the static
// itself, so later reads keep the patched native. every test patches a static of its own: a patch
// deoptimizes its name for the whole unit
/* eslint-disable es/no-async-functions -- safe */
function patched() { return 'PATCHED'; }
// a standalone POST pass detects on lowered text, where a destructure and an `await` are helper calls
// the census cannot see through
const testBeforeLowering = typeof E2E_DETECT_LOWERED === 'undefined' ? QUnit.test : QUnit.skip;

QUnit.test('mutation call channel: a slot an inline callee fills from a parameter', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  try {
    const w = (x => [x, 0])(Array);
    w[0].from = patched;
    assert.same(Array.from([1]), 'PATCHED');
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});

QUnit.test('mutation call channel: a slot of the container a constructor returns', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'of');
  function Make() { return [Array, 0]; }
  try {
    const w = new Make();
    w[0].of = patched;
    assert.same(Array.of(1), 'PATCHED');
  } finally {
    restoreProperty(Array, 'of', descriptor);
  }
});

testBeforeLowering('mutation call channel: a destructured slot of a constructor call', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Object, 'entries');
  function Make() { return [Object, 0]; }
  try {
    const [O] = new Make();
    O.entries = patched;
    assert.same(Object.entries({}), 'PATCHED');
  } finally {
    restoreProperty(Object, 'entries', descriptor);
  }
});

testBeforeLowering('mutation call channel: a destructured slot of an awaited call', assert => {
  const done = assert.async();
  const descriptor = Object.getOwnPropertyDescriptor(Object, 'values');
  function make() { return [Object, 0]; }
  (async () => {
    try {
      const [O] = await make();
      O.values = patched;
      assert.same(Object.values({}), 'PATCHED');
    } finally {
      restoreProperty(Object, 'values', descriptor);
      done();
    }
  })();
});
