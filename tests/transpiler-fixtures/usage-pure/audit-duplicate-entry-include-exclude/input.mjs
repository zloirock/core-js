// entry-path `array/from` appears in both `include` and `exclude`. duplicate detection
// covers entry-path patterns (not just module patterns) and surfaces a clear
// "matched by both" validation error
Array.from(x);
