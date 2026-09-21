// The selected value needs its static entry or instance dispatch.
// Preserve the user branch and evaluate every key and receiver once.
for (const { entries } of [flag ? Object : user]) consume(entries);
