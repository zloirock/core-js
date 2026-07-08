// `Iterator.range` is an esnext-only feature (module `esnext.iterator.range`; no `es.iterator.range`
// exists). Excluding it under the WRONG namespace (`es.iterator.range`) does NOT silently miss the
// injected esnext module - the unused-pattern validation rejects it, so a namespace typo is surfaced
// rather than leaving the polyfill quietly injected. No feature exists under both `es.X` and `esnext.X`.
Iterator.range(0, 10);
