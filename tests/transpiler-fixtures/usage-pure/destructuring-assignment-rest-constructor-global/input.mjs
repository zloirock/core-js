// A constructor entry makes its index the source of both named properties and rest.
let resolve, rest;
({ resolve, ...rest } = Promise);
