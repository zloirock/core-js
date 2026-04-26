// validation: an item in `include` whose JSON serialization throws (circular reference)
// must still surface the original type-mismatch error, not a stringify crash.
foo;
