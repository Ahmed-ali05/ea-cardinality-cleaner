# Contributing

For a bug report, include the EA edition, version and build, diagram notation, expected result, and relevant **Script Output**. Use a small example with invented table names.

For code changes:

1. Edit `scripts/pulisci-diagramma.js`. Keep it compatible with EA's JScript engine and free of extra runtime dependencies.
2. Add a behavior test for changes to the cleaning logic.
3. Run `npm run check` and `npm test` with Node.js 22 or later.

Tests simulate EA; they do not verify its COM integration or visual behavior. Report the exact EA build and notation when testing inside EA.
