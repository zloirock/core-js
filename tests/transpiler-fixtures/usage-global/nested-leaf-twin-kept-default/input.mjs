// The default supplies both the kept nested binding and the method.
// The earlier initializer still runs before this one shared slot read.
function take(source, fallback) {
  const lead = effect('lead'),
        { data: { other: { value }, at: method } = fallback } = source;
  return [lead, value, method];
}
