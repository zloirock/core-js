// BOM + single polyfill — verifies BOM round-trips through the pipeline when
// hasNesting() is false (fast path) and only appendRight/prepend mutate the source
Array.from(x);
