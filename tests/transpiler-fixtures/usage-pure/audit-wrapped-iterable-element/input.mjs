// The iterable an element-reading static is handed stays the iterable behind a transparent wrapper,
// and both parsers have to see it that way: one strips parentheses while parsing, the other keeps a
// node for them, so a shape test on the raw argument answered differently for one source and the
// two emitters injected different helpers. Every method here exists on more than one built-in, so
// the choice of helper is what the narrow buys. The last case declines: nothing names what the
// argument holds, so the element stays unknown and the call dispatches generically.
async function wrappedIterable() {
  const paren = (await Promise.all((['ab', 'cd'])))[0];
  paren.at(0);
  const cast = (await Promise.all(['ab', 'cd'] as any))[0];
  cast.includes('a');
  declare const dynamic: any;
  const opaque = (await Promise.all((dynamic)))[0];
  opaque.indexOf('a');
}
wrappedIterable();
