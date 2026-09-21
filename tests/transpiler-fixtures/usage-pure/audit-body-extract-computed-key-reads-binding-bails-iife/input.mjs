// A computed key reads the preceding parameter binding in an IIFE.
// Mirror and body extraction would move that read out of order; the parameter stays native.
(function pick({ of, [of]: picked } = Array) {
  return [of, picked];
})();
