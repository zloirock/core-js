// `.bind(null)(Array)` and `.call(null, Object)` route the receiver through an
// intermediate function value rather than passing it as a direct call argument. the
// static rewrite only matches direct argument positions, so `from` / `keys` stay as
// plain destructure reads (under-polyfill is accepted for this edge shape)
(function ({ from }) {
  return from([1, 2]);
}).bind(null)(Array);
(function ({ keys }) {
  return keys({ a: 1 });
}).call(null, Object);
