// A user container holding Array resolves its nested static in a loop initializer.
// The prefix function and calls through the binding keep their independent instance polyfills.
const userGlobal = { Array };
for (const { Array: { from } } = ((() => [].values())(), userGlobal); false;) from([]).at(0);
