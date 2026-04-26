// static-method call wrapped in TS `as`: the receiver shape is recognised through the
// cast wrapper and the static polyfill is emitted as usual.
(Array.from as any)([1]);
