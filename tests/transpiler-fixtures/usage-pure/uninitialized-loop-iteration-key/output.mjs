// A loop declaration without an initializer still receives each iterable value.
// The computed constructor key retains its existing loop policy.
for (let key of ["from"]) use(Array[key]);