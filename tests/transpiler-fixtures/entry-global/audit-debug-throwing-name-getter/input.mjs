// validation: an adversarial `debug` value whose `.name` getter throws must still surface
// the original type-mismatch error, not a secondary getter crash.
foo;
