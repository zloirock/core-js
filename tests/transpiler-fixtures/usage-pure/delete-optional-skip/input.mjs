// `Promise` in `delete x.Promise` operand position is preserved verbatim - the property
// access stays as written so the emit remains syntactically valid. Receiver `globalThis`
// is still polyfilled normally.
delete globalThis?.Promise;
