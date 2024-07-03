'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    'ember-cli-babel': { enableTypeScriptTransform: true },

    autoImport: {
      forbidEval: true,
      watchDependencies: ['ember-modifier'],
    },
  });

  return app.toTree();
};
