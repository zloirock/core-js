// An exported pattern combines an effectful static key and a native sibling.
// The key effect runs before the static binding, both f and isArray stay exported,
// and the native sibling is read from the original receiver.
export const { [(effectful(), 'from')]: f, isArray } = Array;
