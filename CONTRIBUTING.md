# How To Contribute

This repo is divided into multiple packages using Yarn workspaces:

- `addon` is the actual ember-modifier addon
- `test-app` is its test suite

## Installation

* `git clone https://github.com/ember-modifier/ember-modifier.git`
* `cd ember-modifier`
* `yarn install`

## Linting

Inside any of the packages you can run:

* `yarn lint`
* `yarn lint:fix`

## Running tests

* `cd addon && pnpm run start` – Builds the addon in "watch mode" so changes picked up by test app.
* `cd test-app && ember test` – Runs the test suite on the current Ember version
* `cd test-app && ember test --server` – Runs the test suite in "watch mode"
* `cd test-app && ember try:each` – Runs the test suite against multiple Ember versions

## Running the dummy application

* `cd test-app && ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
