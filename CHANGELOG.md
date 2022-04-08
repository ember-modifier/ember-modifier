


## v3.2.7 (2022-04-08)

#### :bug: Bug Fix
* [#288](https://github.com/ember-modifier/ember-modifier/pull/288) Prevent triggering deprecation messages incorrectly for class-based modifiers ([@bertdeblock](https://github.com/bertdeblock))

#### Committers: 1
- Bert De Block ([@bertdeblock](https://github.com/bertdeblock))

## v3.2.6 (2022-04-07)

#### :bug: Bug Fix
* [#283](https://github.com/ember-modifier/ember-modifier/pull/283) Fix deprecations for class-based modifiers ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## v3.2.5 (2022-04-06)

#### :bug: Bug Fix
* [#281](https://github.com/ember-modifier/ember-modifier/pull/281) Fix deprecation notice ([@evoactivity](https://github.com/evoactivity))

#### Committers: 1
- Liam Potter ([@evoactivity](https://github.com/evoactivity))

## v3.2.4 (2022-04-06)

#### :bug: Bug Fix
* [#280](https://github.com/ember-modifier/ember-modifier/pull/280) Use "export type" for FunctionBasedModifier interface (back-ported from [#270](https://github.com/ember-modifier/ember-modifier/pull/270)) ([@ef4](https://github.com/ef4))

#### Committers: 1
- Edward Faulkner ([@ef4](https://github.com/ef4))

## v3.2.3 (2022-04-05)

#### :bug: Bug Fix
* [#278](https://github.com/ember-modifier/ember-modifier/pull/278) Make `FunctionBasedModifier` an (abstract) constructor type (backported from [#277](https://github.com/ember-modifier/ember-modifier/pull/277)) ([@dfreeman](https://github.com/dfreeman))

#### :house: Internal
* [#261](https://github.com/ember-modifier/ember-modifier/pull/261) Add tests for unions in legacy args form ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 2
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))
- Dan Freeman ([@dfreeman](https://github.com/dfreeman))

## v3.2.2 (2022-03-31)

#### :bug: Bug Fix
* [#253](https://github.com/ember-modifier/ember-modifier/pull/253) Check type of teardown before saving or using it ([@chriskrycho](https://github.com/chriskrycho))
* [#252](https://github.com/ember-modifier/ember-modifier/pull/252) Invert deprecation for missing options ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## v3.2.1 (2022-03-31)

#### :bug: Bug Fix
* [#247](https://github.com/ember-modifier/ember-modifier/pull/247) Fix "default" positional and named argument types ([@chriskrycho](https://github.com/chriskrycho))

#### :house: Internal
* [#246](https://github.com/ember-modifier/ember-modifier/pull/246) Don't commit generated .d.ts files ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## v3.2.0 (2022-03-29)

#### :rocket: Enhancement
* [#230](https://github.com/ember-modifier/ember-modifier/pull/230) Solidify types for release ([@chriskrycho](https://github.com/chriskrycho))
* [#222](https://github.com/ember-modifier/ember-modifier/pull/222) Introduce `eager` option to function-based modifiers ([@chriskrycho](https://github.com/chriskrycho))
* [#217](https://github.com/ember-modifier/ember-modifier/pull/217) Introduce new `modify` hook ([@chriskrycho](https://github.com/chriskrycho))
* [#218](https://github.com/ember-modifier/ember-modifier/pull/218) Add TS 4.6 to CI and README ([@chriskrycho](https://github.com/chriskrycho))
* [#210](https://github.com/ember-modifier/ember-modifier/pull/210) Support `Signature` types for modifiers ([@chriskrycho](https://github.com/chriskrycho))
* [#135](https://github.com/ember-modifier/ember-modifier/pull/135) Add TypeScript 4.5 to testing matrix ([@SergeAstapov](https://github.com/SergeAstapov))

#### :bug: Bug Fix
* [#134](https://github.com/ember-modifier/ember-modifier/pull/134) Properly re-export types ([@mydea](https://github.com/mydea))

#### :memo: Documentation
* [#227](https://github.com/ember-modifier/ember-modifier/pull/227) Update docs and export type utils ([@chriskrycho](https://github.com/chriskrycho))
* [#218](https://github.com/ember-modifier/ember-modifier/pull/218) Add TS 4.6 to CI and README ([@chriskrycho](https://github.com/chriskrycho))
* [#198](https://github.com/ember-modifier/ember-modifier/pull/198) README: autotracking clarification and misc. cleanup ([@chriskrycho](https://github.com/chriskrycho)

#### :no_entry_sign: Deprecations
* [#223](https://github.com/ember-modifier/ember-modifier/pull/223) Deprecate modifier() without { eager: false }
* [#221](https://github.com/ember-modifier/ember-modifier/pull/221) Deprecate this.element and this.args on class-based modifiers
* [#220](https://github.com/ember-modifier/ember-modifier/pull/220) Deprecate didInstall, didReceiveArguments, and didUpdateArguments

#### :house: Internal
* [#226](https://github.com/ember-modifier/ember-modifier/pull/226) Upgrade to latest @types for @ember/modifier ([@chriskrycho](https://github.com/chriskrycho))
* [#219](https://github.com/ember-modifier/ember-modifier/pull/219) Add ':no_entry_sign: Deprecations' to lerna config ([@chriskrycho](https://github.com/chriskrycho))
* [#163](https://github.com/ember-modifier/ember-modifier/pull/163) Drop support for Classic and jQuery scenarios ([@chriskrycho](https://github.com/chriskrycho))
* [#162](https://github.com/ember-modifier/ember-modifier/pull/162) Remove babel.config.js ([@chriskrycho](https://github.com/chriskrycho))
* [#161](https://github.com/ember-modifier/ember-modifier/pull/161) CI config: tweak how TS versions are tested ([@chriskrycho](https://github.com/chriskrycho))
* [#123](https://github.com/ember-modifier/ember-modifier/pull/123) Update npmignore file ([@SergeAstapov](https://github.com/SergeAstapov))
* [#109](https://github.com/ember-modifier/ember-modifier/pull/109) Create dependabot.yml ([@banupriya-bp](https://github.com/banupriya-bp))
* [#108](https://github.com/ember-modifier/ember-modifier/pull/108) Actually remove `<N>` from `ModifierArgs` ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 4
- Banupriya ([@banupriya-bp](https://github.com/banupriya-bp))
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))
- Francesco Novy ([@mydea](https://github.com/mydea))
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))

## v3.2.0 (2022-03-29)

#### :rocket: Enhancement
* [#230](https://github.com/ember-modifier/ember-modifier/pull/230) Solidify types for release ([@chriskrycho](https://github.com/chriskrycho))
* [#222](https://github.com/ember-modifier/ember-modifier/pull/222) Introduce `eager` option to function-based modifiers ([@chriskrycho](https://github.com/chriskrycho))
* [#217](https://github.com/ember-modifier/ember-modifier/pull/217) Introduce new `modify` hook ([@chriskrycho](https://github.com/chriskrycho))
* [#218](https://github.com/ember-modifier/ember-modifier/pull/218) Add TS 4.6 to CI and README ([@chriskrycho](https://github.com/chriskrycho))
* [#210](https://github.com/ember-modifier/ember-modifier/pull/210) Support `Signature` types for modifiers ([@chriskrycho](https://github.com/chriskrycho))
* [#135](https://github.com/ember-modifier/ember-modifier/pull/135) Add TypeScript 4.5 to testing matrix ([@SergeAstapov](https://github.com/SergeAstapov))

#### :bug: Bug Fix
* [#134](https://github.com/ember-modifier/ember-modifier/pull/134) Properly re-export types ([@mydea](https://github.com/mydea))

#### :memo: Documentation
* [#227](https://github.com/ember-modifier/ember-modifier/pull/227) Update docs and export type utils ([@chriskrycho](https://github.com/chriskrycho))
* [#218](https://github.com/ember-modifier/ember-modifier/pull/218) Add TS 4.6 to CI and README ([@chriskrycho](https://github.com/chriskrycho))
* [#198](https://github.com/ember-modifier/ember-modifier/pull/198) README: autotracking clarification and misc. cleanup ([@chriskrycho](https://github.com/chriskrycho)

#### :house: Internal
* [#226](https://github.com/ember-modifier/ember-modifier/pull/226) Upgrade to latest @types for @ember/modifier ([@chriskrycho](https://github.com/chriskrycho))
* [#219](https://github.com/ember-modifier/ember-modifier/pull/219) Add ':no_entry_sign: Deprecations' to lerna config ([@chriskrycho](https://github.com/chriskrycho))
* [#163](https://github.com/ember-modifier/ember-modifier/pull/163) Drop support for Classic and jQuery scenarios ([@chriskrycho](https://github.com/chriskrycho))
* [#162](https://github.com/ember-modifier/ember-modifier/pull/162) Remove babel.config.js ([@chriskrycho](https://github.com/chriskrycho))
* [#161](https://github.com/ember-modifier/ember-modifier/pull/161) CI config: tweak how TS versions are tested ([@chriskrycho](https://github.com/chriskrycho))
* [#123](https://github.com/ember-modifier/ember-modifier/pull/123) Update npmignore file ([@SergeAstapov](https://github.com/SergeAstapov))
* [#109](https://github.com/ember-modifier/ember-modifier/pull/109) Create dependabot.yml ([@banupriya-bp](https://github.com/banupriya-bp))
* [#108](https://github.com/ember-modifier/ember-modifier/pull/108) Actually remove `<N>` from `ModifierArgs` ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 4
- Banupriya ([@banupriya-bp](https://github.com/banupriya-bp))
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))
- Francesco Novy ([@mydea](https://github.com/mydea))
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))

## v3.1.0 (2022-01-25)

#### :rocket: Enhancement
* [#135](https://github.com/ember-modifier/ember-modifier/pull/135) Add TypeScript 4.5 to testing matrix ([@SergeAstapov](https://github.com/SergeAstapov))

#### :bug: Bug Fix
* [#134](https://github.com/ember-modifier/ember-modifier/pull/134) Properly re-export types ([@mydea](https://github.com/mydea))

#### :house: Internal
* [#162](https://github.com/ember-modifier/ember-modifier/pull/162) Remove babel.config.js ([@chriskrycho](https://github.com/chriskrycho))
* [#161](https://github.com/ember-modifier/ember-modifier/pull/161) CI config: tweak how TS versions are tested ([@chriskrycho](https://github.com/chriskrycho))
* [#123](https://github.com/ember-modifier/ember-modifier/pull/123) Update npmignore file ([@SergeAstapov](https://github.com/SergeAstapov))
* [#109](https://github.com/ember-modifier/ember-modifier/pull/109) Create dependabot.yml ([@banupriya-bp](https://github.com/banupriya-bp))

#### Committers: 4
- Banupriya ([@banupriya-bp](https://github.com/banupriya-bp))
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))
- Francesco Novy ([@mydea](https://github.com/mydea))
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))

## v3.0.0 (2021-10-27)

#### :boom: Breaking Change
* [#97](https://github.com/ember-modifier/ember-modifier/pull/97) Drop support for Node <12, Ember <3.24, TS <4.2 ([@chriskrycho](https://github.com/chriskrycho))

#### :rocket: Enhancement
* [#100](https://github.com/ember-modifier/ember-modifier/pull/100) Ember 4.x compatibility ([@chriskrycho](https://github.com/chriskrycho))
* [#91](https://github.com/ember-modifier/ember-modifier/pull/91) Use `positional` and `named` as argument names in `ember g modifier` blueprint ([@bertdeblock](https://github.com/bertdeblock))

#### :bug: Bug Fix
* [#79](https://github.com/ember-modifier/ember-modifier/pull/79) Types: fix strictness and add a failing test ([@chriskrycho](https://github.com/chriskrycho))

#### :memo: Documentation
* [#99](https://github.com/ember-modifier/ember-modifier/pull/99) docs: update README with compatibility info ([@chriskrycho](https://github.com/chriskrycho))
* [#90](https://github.com/ember-modifier/ember-modifier/pull/90) Improve logic in `removeEventListener()` from examples ([@MrChocolatine](https://github.com/MrChocolatine))

#### :house: Internal
* [#104](https://github.com/ember-modifier/ember-modifier/pull/104) chore: run TS compat independent of tests ([@chriskrycho](https://github.com/chriskrycho))
* [#101](https://github.com/ember-modifier/ember-modifier/pull/101) chore: update linting configuration ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 4
- Bert De Block ([@bertdeblock](https://github.com/bertdeblock))
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))
- Max Z ([@MrChocolatine](https://github.com/MrChocolatine))
- Nathaniel Furniss ([@nlfurniss](https://github.com/nlfurniss))

## v2.1.2 (2021-05-28)

#### :bug: Bug Fix
* [#87](https://github.com/ember-modifier/ember-modifier/pull/87) Add support for `3.22` modifier capabilities ([@sandydoo](https://github.com/sandydoo))

#### :house: Internal
* [#77](https://github.com/ember-modifier/ember-modifier/pull/77) migrate from TravisCI to GitHub Actions ([@jelhan](https://github.com/jelhan))
* [#70](https://github.com/ember-modifier/ember-modifier/pull/70) small typo ([@bartocc](https://github.com/bartocc))

#### Committers: 3
- Jeldrik Hanschke ([@jelhan](https://github.com/jelhan))
- Julien Palmas ([@bartocc](https://github.com/bartocc))
- Sander Melnikov ([@sandydoo](https://github.com/sandydoo))

## v2.1.1 (2020-09-17)

#### :bug: Bug Fix
* [#62](https://github.com/ember-modifier/ember-modifier/pull/62) Update minimum version of ember-destroyable-polyfill. ([@rwjblue](https://github.com/rwjblue))

#### :memo: Documentation
* [#57](https://github.com/ember-modifier/ember-modifier/pull/57) Update documentation to use `assert` from `@ember/debug` for type narrowing ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 2
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v2.1.0 (2020-08-02)

#### :rocket: Enhancement
* [#55](https://github.com/ember-modifier/ember-modifier/pull/55) Update ember-destroyable-polyfill to 2.0.0. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v2.0.1 (2020-07-31)

#### :bug: Bug Fix
* [#54](https://github.com/ember-modifier/ember-modifier/pull/54) Update dependencies to fix issues with `@ember/destroyable`. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v2.0.0 (2020-07-30)

#### :boom: Breaking Change
* [#45](https://github.com/ember-modifier/ember-modifier/pull/45) Remove module unification support from blueprints. ([@rwjblue](https://github.com/rwjblue))
* [#31](https://github.com/ember-modifier/ember-modifier/pull/31) Drop support for Node 8 and 9 ([@chriskrycho](https://github.com/chriskrycho))

#### :rocket: Enhancement
* [#46](https://github.com/ember-modifier/ember-modifier/pull/46) Use `ember-cli-htmlbars` for inline precompilation in blueprints. ([@rwjblue](https://github.com/rwjblue))
* [#41](https://github.com/ember-modifier/ember-modifier/pull/41) TS: upgrade to 3.9; implement RFC for type stability ([@chriskrycho](https://github.com/chriskrycho))
* [#38](https://github.com/ember-modifier/ember-modifier/pull/38) Deprecate the `willRemove` hook for class based modifiers. ([@chriskrycho](https://github.com/chriskrycho))
* [#23](https://github.com/ember-modifier/ember-modifier/pull/23) Convert the addon to TypeScript ([@chriskrycho](https://github.com/chriskrycho))

#### :bug: Bug Fix
* [#48](https://github.com/ember-modifier/ember-modifier/pull/48) Migrate to `@ember/destroyable` for destruction. ([@rwjblue](https://github.com/rwjblue))

#### :memo: Documentation
* [#39](https://github.com/ember-modifier/ember-modifier/pull/39) Update README Table of Contents w/Philosophy section ([@chriskrycho](https://github.com/chriskrycho))
* [#1](https://github.com/ember-modifier/ember-modifier/pull/1) Adds a philosophy section to the guide ([@pzuraq](https://github.com/pzuraq))
* [#22](https://github.com/ember-modifier/ember-modifier/pull/22) Fix arguments destructuring in `README.md` ([@MrChocolatine](https://github.com/MrChocolatine))
* [#15](https://github.com/ember-modifier/ember-modifier/pull/15) Fix incorrect `makeFunctionalModifier` reference in `README.md` ([@tomwayson](https://github.com/tomwayson))

#### :house: Internal
* [#49](https://github.com/ember-modifier/ember-modifier/pull/49) Refactor / cleanup owner usage in modifier manager APIs. ([@rwjblue](https://github.com/rwjblue))
* [#47](https://github.com/ember-modifier/ember-modifier/pull/47) Update addon blueprint from `ember-cli@3.13` to `ember-cli@3.20` ([@rwjblue](https://github.com/rwjblue))
* [#34](https://github.com/ember-modifier/ember-modifier/pull/34) Add Prettier, configured according to [emberjs/rfcs#628](https://github.com/emberjs/rfcs/pull/628) ([@chriskrycho](https://github.com/chriskrycho))
* [#36](https://github.com/ember-modifier/ember-modifier/pull/36) Run TS tests in parallel in CI ([@chriskrycho](https://github.com/chriskrycho))
* [#30](https://github.com/ember-modifier/ember-modifier/pull/30) Support linting TS, and test types ([@chriskrycho](https://github.com/chriskrycho))
* [#16](https://github.com/ember-modifier/ember-modifier/pull/16) Use `release-it` and `lerna-changelog` to manage releases ([@elwayman02](https://github.com/elwayman02))

#### Committers: 6
- Chris Garrett ([@pzuraq](https://github.com/pzuraq))
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))
- Jordan Hawker ([@elwayman02](https://github.com/elwayman02))
- Maxime Zanot ([@MrChocolatine](https://github.com/MrChocolatine))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Tom Wayson ([@tomwayson](https://github.com/tomwayson))


## v1.0.4 (2020-07-30)

#### :bug: Bug Fix
* [#50](https://github.com/ember-modifier/ember-modifier/pull/50) Avoid issuing a deprecation during destruction on Ember 3.20+ ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## 1.0.3 (2020-01-23)

#### :bug: Bug Fix
* [#13](https://github.com/ember-modifier/ember-modifier/pull/13) Fix issues with `Symbol` usage on IE11 ([@raido](https://github.com/raido))

#### Committers: 1
- Raido Kuli ([@raido](https://github.com/raido))


## 1.0.2 (2019-10-31)

#### :rocket: Enhancement
* [#6](https://github.com/ember-modifier/ember-modifier/pull/6) Add blueprint ([@spencer516](https://github.com/spencer516))

#### :memo: Documentation
* [#4](https://github.com/ember-modifier/ember-modifier/pull/4) Fix modifier class import in README ([@asakusuma](https://github.com/asakusuma))

#### Committers: 2
- Asa Kusuma ([@asakusuma](https://github.com/asakusuma))
- Spencer P ([@spencer516](https://github.com/spencer516))

