// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims.
{
  const r = (({
    w: [{
      hasOwn
    }]
  }) => hasOwn)({
    get w() {
      return [Object];
    }
  });
}