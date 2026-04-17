async function consume(sources) {
  for await (using resource of sources) {
    resource.handles.at(-1);
  }
  return Array.from(sources);
}
