// entry-path `array/from` appears in both `include` and `exclude`. duplicate detection
// must cover entry-path patterns too (not just module patterns), surfacing a clear
// "matched by both" validation error instead of silently dropping the polyfill
Array.from(x);
