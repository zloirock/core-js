// A mutated proxy SLOT (`globalThis.self = { ... }`) is a FILE-level fact: the emitters deopt
// every read of that name in this module, so these rows live in their own file, beside the other
// `mutated-slots*` ones. What they lock is the VALUE - the user's own object must survive every
// route that reads the name, an alias hop included. The write happens INSIDE each row and is
// undone in `finally`: the deopt is what the file's presence buys, while the realm other files
// share must come back exactly as it was.
const USER_SELF = { Array: { from: () => 'USER-FROM' }, inner: { [Symbol.iterator]: () => 'USER-ITER' } };

function withMutatedSelf(body) {
  const saved = Object.getOwnPropertyDescriptor(globalThis, 'self');
  globalThis.self = USER_SELF;
  try {
    return body();
  } finally {
    if (saved) Object.defineProperty(globalThis, 'self', saved);
    else delete globalThis.self;
  }
}

QUnit.test('mutated proxy root: a nested leaf reads the user object', assert => {
  assert.same(withMutatedSelf(() => {
    // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the BARE name is the subject: it is what the mutated slot replaces
    const { Array: { from } } = self;
    return from();
  }), 'USER-FROM');
});

QUnit.test('mutated proxy root: an ALIAS of the name reads it too', assert => {
  assert.same(withMutatedSelf(() => {
    // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the BARE name is the subject: it is what the mutated slot replaces
    const alias = self;
    const { Array: { from } } = alias;
    return from();
  }), 'USER-FROM');
});

QUnit.test('mutated proxy root: a logical default over the name keeps the user value', assert => {
  assert.same(withMutatedSelf(() => {
    // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the BARE name is the subject: it is what the mutated slot replaces
    const { from } = (self ?? {}).Array;
    return from();
  }), 'USER-FROM');
});

QUnit.test('mutated proxy root: a param default over the name keeps the user value', assert => {
  assert.same(withMutatedSelf(() => {
    // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the BARE name is the subject: it is what the mutated slot replaces
    function read({ Array: { from } } = self) {
      return from();
    }
    return read();
  }), 'USER-FROM');
});

// NATIVE-SYMBOL ONLY: conflict with Babel `_toPropertyKey` -> `_toPrimitive`
if (!Symbol.sham) QUnit.test('mutated proxy root: a symbol leaf stays the user value', assert => {
  assert.same(withMutatedSelf(() => {
    // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the BARE name is the subject: it is what the mutated slot replaces
    const { inner: { [Symbol.iterator]: it } } = self;
    return it();
  }), 'USER-ITER');
});
