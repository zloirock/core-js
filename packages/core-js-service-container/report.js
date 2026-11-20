export default function report(emit, context, detail) {
  try {
    emit();
  } catch (loggingError) {
    try {
      process.stderr.write(`${ context }: ${ detail }; logging failed: ${ loggingError }\n`);
    } catch { /* A broken logging channel must not replace the original failure. */ }
  }
}
