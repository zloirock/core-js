// reassignment INSIDE a callback body is deferred (closure-captured, runs only when invoked),
// yet the source-position window check still counts it because the closure's source span sits
// between the candidate hit and the use site. this is the over-conservative side of a
// position-only check: `() => { f = ... }` is never invoked here, but the window can't tell -
// an acceptable trade-off vs a false narrow when the callback IS invoked between hit and use.
let f;
f = { data: [1, 2, 3] };
[1].forEach(() => {
  f = { data: 'string' };
});
f.data.at(-1);
