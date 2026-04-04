function getItems(): string[] { return ['a', 'b']; }
const fn = getItems as () => string[];
fn().at(-1);
