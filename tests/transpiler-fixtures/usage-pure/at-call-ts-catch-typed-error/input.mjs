try {
  doSomething();
} catch (e: Error) {
  e.message.at(0);
}
