// `for await` is an iteration AND an async one: its helper reads both well-known symbols and
// settles each step through `Promise.resolve` / `Promise.reject`, so the promise family is owed
// beside the iterator one. The `.at` call on the binding is the instance claim next to it.
for await (const k of Object.keys(x).values().toAsync()) {
  k.at(0);
}
