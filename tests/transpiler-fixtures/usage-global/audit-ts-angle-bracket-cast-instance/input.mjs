// TS angle-bracket cast `<T>x.method(...)` (legacy syntax): the cast must be peeled
// to recognise the underlying instance-method receiver.
(<any[]>arr).includes(1);
