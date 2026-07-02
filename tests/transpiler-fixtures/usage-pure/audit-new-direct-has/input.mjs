// Baseline: direct `new Map().has(1)` - native `.has` already on Map.prototype, plugin
// expected to skip instance polyfill emission since the constructor was rewritten to _Map.
new Map().has(1);
