// Observable arguments and unknown callees keep their original receivers.
// Export, escape, reassignment, rest and spread prevent caller-only extraction.
function observed([{ from } = Array]) { return [arguments[0], from]; }
function referenced({ of } = Array) { const original = arguments; return [original, of]; }
export function exported([{ isArray } = Array]) { return isArray; }
function escaped([{ from } = Array]) { return from; }
const held = { escaped };
let reassigned = ([{ of } = Array]) => of;
function rest(...[{ from } = Array]) { return from; }
function spread([{ of } = Array]) { return of; }
function invoke(args) { return spread(...args); }
observed([Array]);
referenced(Array);
exported([Array]);
held.escaped([Array]);
reassigned = value => value;
reassigned([Array]);
rest(Array);
invoke([[Array]]);
