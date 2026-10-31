const provenProbe = () => globalThis.window;
// NEGATIVE: a PLAIN read off the probe-yielding call throws natively, and erasing that throw is the
// ordinary collapse - the guard question is only about a `?.` the emit would drop
export const plainReadOffCall = provenProbe().self.Array?.prototype;
