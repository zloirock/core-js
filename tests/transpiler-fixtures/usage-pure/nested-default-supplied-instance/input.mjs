// An open slot selects its own instance method or the receiver default's static.
const source = Function('return { list: [3] }')();
const { list: { entries } = Object } = source;
use(entries.call(source.list).next().value);
