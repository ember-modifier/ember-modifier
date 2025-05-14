'use strict';

const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

// These are needed for ember-source < 4.8, when preview types were first shipped
const emberTypesPackages = {
  '@types/ember-resolver': '^5.0.13',
  '@types/ember__application': '^4.0.5',
  '@types/ember__owner': '^4.0.3',
};

module.exports = async function () {
  return {
    usePnpm: true,
    scenarios: [
      {
        name: 'ember-lts-3.24',
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^2.4.0',
            '@types/ember-qunit': '^5.0.2',
            'ember-cli': '~4.12.0',
            'ember-cli-app-version': '^5.0.0',
            'ember-page-title': '^7.0.0',
            'ember-qunit': '^5.1.5',
            'ember-resolver': '^8.0.0',
            'ember-source': '~3.24.0',
            ...emberTypesPackages,
          },
        },
      },
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^2.4.0',
            'ember-cli': '~4.12.0',
            'ember-qunit': '^5.1.5',
            'ember-resolver': '^8.0.0',
            'ember-source': '~3.28.0',
            ...emberTypesPackages,
          },
        },
      },
      {
        name: 'ember-lts-4.4',
        npm: {
          devDependencies: {
            'ember-source': '~4.4.0',
            'ember-resolver': '^8.0.0',
            ...emberTypesPackages,
          },
        },
      },
      {
        name: 'ember-lts-4.8',
        npm: {
          devDependencies: {
            'ember-source': '~4.8.0',
          },
        },
      },
      {
        name: 'ember-lts-4.12',
        npm: {
          devDependencies: {
            'ember-source': '~4.12.0',
          },
        },
      },
      {
        name: 'ember-lts-5.4',
        npm: {
          devDependencies: {
            'ember-source': '~5.4.0',
            rsvp: '^4.8.5',
          },
        },
      },
      {
        name: 'ember-lts-5.8',
        npm: {
          devDependencies: {
            'ember-source': '~5.8.0',
            rsvp: '^4.8.5',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': 'latest',
            rsvp: '^4.8.5',
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': 'beta',
            rsvp: '^4.8.5',
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': 'alpha',
            rsvp: '^4.8.5',
          },
        },
      },
      embroiderSafe({
        npm: {
          devDependencies: {
            '@embroider/core': '^3.5.5',
            '@embroider/compat': '^3.9.0',
            '@embroider/webpack': '^4.1.0',
          },
        },
      }),
      embroiderOptimized({
        npm: {
          devDependencies: {
            '@embroider/core': '^3.5.5',
            '@embroider/compat': '^3.9.0',
            '@embroider/webpack': '^4.1.0',
          },
        },
      }),
    ],
  };
};
