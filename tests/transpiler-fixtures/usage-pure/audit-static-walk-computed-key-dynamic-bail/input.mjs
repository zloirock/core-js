// An unknown computed key cannot prove which nested slot contains Array.
// A runtime identity check supplies Array.from only for an actual Array receiver.
// Missing and custom slots keep their native behavior.
declare const fn: () => string;
const wrapper = { [fn()]: Array };
const { a: { from } } = wrapper;
from;
[1].at(0);
