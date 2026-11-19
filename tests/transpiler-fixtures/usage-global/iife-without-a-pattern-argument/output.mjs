// An IIFE called without its pattern argument throws while coercing the missing value.
// The member is never read, so neither usage-global emitter injects an `at` family.
(function ({
  at
}) {
  return at;
})();