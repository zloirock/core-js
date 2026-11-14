// A defined global claim drops its default without losing the initializer prefix or residual.
const { AggregateError: AE = fallback(), other } = (effect(), globalThis);
use(AE, other);
