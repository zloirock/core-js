// A literal-array parameter default retains its native from read and empty element fallback.
{
  function fromArr([{
    from
  } = {}] = [Array]) {
    return from;
  }
}