// An opaque iteration still carries its source into a head passed to an unknown consumer.
// A substituted constructor must retain the statics an unknown consumer can read.
for (const value of [...[Map]]) hand(value);
