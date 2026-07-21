// Bare-name slot writes probed at MODULE level, in their own module: a bare global write
// inside a function vetoes substitution of that name file-wide on the read side regardless
// of the mutation record, and a spelled member RESTORE records the slot by itself - so only
// module-level write+read pairs with transform-invisible computed-key restores can observe
// whether the record under test exists (the shape where a missed record substitutes a
// pristine ponyfill over the user's value). writes are restored within the same module body
// (no other module's init runs inside the window), and the assertions consume captured
// values only. isolated from the main slot module: the `self` SLOT write below deopts
// `self`, which the cross-alias tests there depend on keeping pristine.

// the identity self-copy exemption trusts its proxy receiver; when the file REPLACES that
// receiver's slot the copy installs the replacement's value, so the copied name must deopt
// and serve the fake - a pristine ponyfill here would silently bypass it. the `self` writes
// stay transform-VISIBLE (the replaced receiver is the case), the RegExp restore does not
const originalRegExp = globalThis.RegExp;
const hadSelf = 'self' in globalThis;
const originalSelf = globalThis.self;
globalThis.self = { RegExp: { escape: () => 'fake' } };
// eslint-disable-next-line no-global-assign, no-restricted-globals, unicorn/prefer-global-this -- the bare `self` receiver self-copy IS the case under test
RegExp = self.RegExp;
const escapeObserved = RegExp.escape('a');
globalThis[['Reg', 'Exp'].join('')] = originalRegExp;
if (hadSelf) globalThis.self = originalSelf;
else delete globalThis.self;

QUnit.test('mutated-slots-load-time: self-copy off a replaced proxy receiver installs the replacement', assert => {
  assert.same(escapeObserved, 'fake');
});

// a compound self-assign DERIVES a new value - it is NOT the identity restore idiom, so the
// slot records and the read stays verbatim: the source observes the coerced string, and its
// member slot is the primitive's (absent), not a ponyfill
const originalString = globalThis.String;
// eslint-disable-next-line no-global-assign -- the compound self-assign IS the case under test
String += globalThis.String;
const coercedStringType = typeof String;
const stringRawSlot = String.raw;
globalThis[['Str', 'ing'].join('')] = originalString;

QUnit.test('mutated-slots-load-time: compound self-assign is a real slot write, not the restore idiom', assert => {
  assert.same(coercedStringType, 'string');
  assert.same(stringRawSlot, undefined);
});
