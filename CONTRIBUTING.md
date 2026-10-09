# Contributing

Issues and pull requests are welcome. For a bug report, include:

- Enterprise Architect version, build, and edition.
- Connector type and diagram notation, including any custom MDG technology.
- The menu choice used, expected result, and actual result.
- Relevant **Script Output**, with project-specific information removed.

Use a minimal example with invented table names. Do not upload private models, connection strings, credentials, or local undo files.

## Make a change

1. Fork the repository and create a branch.
2. Keep `scripts/ea-cardinality-cleaner.js` standalone and compatible with EA's JScript engine. Avoid modules, modern JavaScript syntax, and extra runtime dependencies.
3. Add a behavior test when fixing application or restore logic.
4. Run `npm run check` and `npm test` with Node.js 22 or later.
5. Open a pull request explaining the user-visible change and its validation.

Node.js is only the test harness. Passing tests does not confirm COM or visual behavior inside EA. If you validate in a live EA session, report the exact build and notation; this helps establish a compatibility record.
