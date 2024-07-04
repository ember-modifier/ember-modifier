# How To Contribute

This repo is divided into multiple packages using Yarn workspaces:

- `ember-modifier` is the actual ember-modifier addon
- `test-app` is its test suite

## Installation

- `git clone https://github.com/ember-modifier/ember-modifier.git`
- `cd ember-modifier`
- `pnpm install`

## Linting

Inside any of the packages you can run:

- `pnpm lint`
- `pnpm lint:fix`

## Building the addon

- `cd ember-modifier`
- `pnpm build`

## Running tests

- `cd ember-modifier && pnpm start` – Builds the addon in "watch mode" so changes picked up by test app.
- `cd test-app && ember test` – Runs the test suite on the current Ember version
- `cd test-app && ember test --server` – Runs the test suite in "watch mode"
- `cd test-app && ember try:each` – Runs the test suite against multiple Ember versions

During development, if you'd like test app to pick up changes in the addon, make sure to run both
`cd ember-modifier && pnpm start` and `cd test-app && ember test --server` in different terminals.

## Running the test application

- `cd test-app && ember serve`
- Visit the test application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://cli.emberjs.com/release/](https://cli.emberjs.com/release/).
