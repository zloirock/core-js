// UTF-8 BOM + composed nested polyfill: BOM is stripped, and the outer polyfill wraps
// the inner polyfill in a single rewrite without byte offsets drifting
Array.from(Array.from(x));
