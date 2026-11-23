// A getter on window can observe this classic script's binding while rest is copied.
const { [(watch(), 'Array')]: { from }, ...rest } = globalThis.window;
record(from([7]), rest.after);
