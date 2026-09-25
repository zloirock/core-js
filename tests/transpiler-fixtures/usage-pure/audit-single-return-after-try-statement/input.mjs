// Try/catch can return Map or Set before the unreachable Array tail. The retained-body proof
// leaves this control flow intact, and every return still guards the read as a candidate - one
// promises no path, so the dead tail rides along. No constructor's namespace is exposed.
const tryFrom = (() => { try { return Map; } catch { return Set; } return Array; })().from([1]);
const tryIntersect = (() => { try { return Map; } catch { return Set; } return Array; })().prototype.intersection;
export { tryFrom, tryIntersect };
