// The first binding receives its fallback before the computed key reads it in the IIFE.
(function pick({ of, [of]: picked } = Array) {
  return [of, picked];
})();
