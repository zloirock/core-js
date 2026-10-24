// a dead-init reaching value (unconditional overwrite before a closure read) resolves in the
// binding's scope too
let reaching = Object;
reaching = Map;
