// Try/catch can return Map or Set before the unreachable Array tail. The retained-body proof
// leaves this control flow intact. Local returns do not expose either constructor's namespace.
const tryFrom = (() => { try { return Map; } catch { return Set; } return Array; })().from([1]);
const tryIntersect = (() => { try { return Map; } catch { return Set; } return Array; })().prototype.intersection;
export { tryFrom, tryIntersect };
