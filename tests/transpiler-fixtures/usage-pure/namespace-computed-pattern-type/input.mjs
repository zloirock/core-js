// Namespace-local computed keys retain their string receiver type.
namespace Box {
  const key = 'name';
  const { [key]: value } = { name: 'alice' };
  value.at(-1);
}
