async function drain(stream) {
  for await (String of stream) use(String.raw(parts));
}
