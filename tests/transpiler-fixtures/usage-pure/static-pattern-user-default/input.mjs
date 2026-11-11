// A default on the imported function property remains live.
export let value;
({ from: { missing: value = fallback() } } = Array);
