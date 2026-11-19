// An optional call in a captured constructor tail skips every following plain step.
export function read(c, list) { return (c ? Array : null)?.from(list).foo?.().length; }
