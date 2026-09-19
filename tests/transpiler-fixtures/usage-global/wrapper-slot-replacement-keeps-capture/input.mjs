// Replacing the wrapper slot changes the wrapper alone. It does not write into the object
// previously captured there, so the original typed static remains eligible for injection.
const original = { x: Array };
const local = original;
const alias = { box: local };
alias.box = { x: { from: () => 'custom' } };
original.x.from([1]);
