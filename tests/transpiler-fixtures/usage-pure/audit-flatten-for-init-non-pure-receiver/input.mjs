// A literal user container retains its native static read in the for-init header.
// The prefix and calls through that binding keep their independent instance polyfills.
const userGlobal = { Array };
for (const { Array: { from } } = ((() => [].values())(), userGlobal); false;) from([]).at(0);
