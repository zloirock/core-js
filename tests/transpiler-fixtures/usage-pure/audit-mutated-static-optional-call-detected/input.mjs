// `Object?.assign(Array, {...})` is an optional-call mutation of a static. it must be detected so
// usage-pure does NOT receiver-less-substitute `Array.from` over the user monkey-patch - the static
// stays raw and the read shares the patched constructor. an unguarded optional call escaped both the
// candidate gate and the site classifier.
Object?.assign(Array, { from: () => [] });
Array.from([1]);
