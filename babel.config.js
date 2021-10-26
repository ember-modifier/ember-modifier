// TODO: this is currently only being used by ESLint via @babel/eslint-parser.
// When #102 lands, we can switch to using it throughout properly.

const { buildEmberPlugins } = require('ember-cli-babel');

module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        require.resolve('@babel/preset-typescript'),
        {
          allowDeclareFields: true,
          onlyRemoveTypeImports: true,
        },
      ],
    ],
    plugins: [...buildEmberPlugins(__dirname)],
  };
};
