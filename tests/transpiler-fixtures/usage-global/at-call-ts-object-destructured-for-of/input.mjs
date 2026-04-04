function process(users: { name: string }[]) {
  for (const { name } of users) {
    name.at(0);
  }
}
