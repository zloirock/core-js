// `Map ||= 1` reads Map first - polyfill import binding is read-only so `_Map ||= 1` throws
// TypeError on write. can't be fixed in code; emit a debug warning so users see why no
// polyfill was injected for this pattern
Map ||= 1;
