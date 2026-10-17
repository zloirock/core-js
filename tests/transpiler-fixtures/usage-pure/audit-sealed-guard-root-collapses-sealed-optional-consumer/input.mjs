// NEGATIVE: an OPTIONAL consumer of the sealed value performs no read - its short-circuit IS the
// guard's void-0 branch, so the test keys onto the probe under the seal
export const sealedOptionalConsumer = (globalThis.window?.self)?.Array?.of;
