// A consumed nested slot lends its default to the overwrite.
// Rewrites inside that default must survive deferred emission.
let method;
({ slot: { at: method = Array.from(source).flatMap(project) } } = { slot: receiver });
