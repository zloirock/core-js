// mix of `?.(`, `?.[`, `?.prop` in a single chain - exercises deoptionalizeNeedle's
// per-`?.` lookahead for `(` / `[` / prop-name (drops both vs keeps `.`)
obj?.(key)?.[idx]?.at(0);
