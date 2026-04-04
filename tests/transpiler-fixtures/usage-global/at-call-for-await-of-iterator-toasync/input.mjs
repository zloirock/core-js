for await (const k of Object.keys(x).values().toAsync()) {
  k.at(0);
}
