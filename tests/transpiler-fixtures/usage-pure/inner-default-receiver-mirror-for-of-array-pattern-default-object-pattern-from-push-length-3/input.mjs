// An empty loop element and a supplied Array element both reach the supported from default route.
// Native iteration decides which receiver is used on each pass.
const out = [];
for (const [{ from } = Array] of [[], [Array]]) out.push(from([1]).length);
export { out };
