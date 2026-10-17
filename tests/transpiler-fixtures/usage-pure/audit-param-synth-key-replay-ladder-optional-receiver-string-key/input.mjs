// an OPTIONAL receiver may be undefined at runtime - native then throws destructuring it, while a
// synthesized literal is always defined. that throw-semantics divergence bails BOTH key spellings
const optionalReceiverHost = { arr: [1, 2] };
// eslint-disable-next-line @stylistic/quote-props -- the string spelling of the bail is under test
const optionalReceiverStringKey = (function ({ 'at': a } = optionalReceiverHost?.arr) {
  return a;
})();
export { optionalReceiverStringKey };
