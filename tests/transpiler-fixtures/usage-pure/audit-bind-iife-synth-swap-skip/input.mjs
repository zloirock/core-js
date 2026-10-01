// The direct function literal's parameter receives the methods through bind/call.
// Mirror the argument while keeping the original invocation and parameter pattern.
(function ({ from }) {
  return from([1, 2]);
}).bind(null)(Array);
(function ({ keys }) {
  return keys({ a: 1 });
}).call(null, Object);
