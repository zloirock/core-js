// A pattern default and renamed static binding retain the source binding name.
// Each known static receives its own pure method.
const { Array: { from: myFrom } = {} } = globalThis;
const { Object: { entries: myEntries } = {} } = globalThis;
myFrom('hi');
myEntries({ k: 1 });
