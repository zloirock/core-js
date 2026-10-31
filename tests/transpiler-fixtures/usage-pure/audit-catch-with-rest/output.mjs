// Object-rest keeps the affected catch pattern native, including its named method slots.
// Independent reads and key/default expressions still receive their own polyfills.
try {
  risky();
} catch ({
  at,
  ...rest
}) {
  at(0);
  rest.message;
}