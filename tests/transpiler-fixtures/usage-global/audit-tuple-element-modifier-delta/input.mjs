// a modifier wrapper over a TUPLE changes its elements exactly as it changes an object's
// members, and the tuple walk peels the wrapper in two places of its own - `Partial<>` makes
// the slot admit undefined, `Required<>` takes an element's own `?` back off
type Pair = [number[], string];
type Opt = [string, number[]?];
declare const fromPartial: Partial<Pair>[0];
declare const fromRequired: Required<Opt>[1];
(fromPartial ?? 'fallback').at(0);
(fromRequired ?? 'fallback').includes(1);
