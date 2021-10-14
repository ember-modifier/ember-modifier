module.exports = {
  useYarn: true,
  scenarios: [
    {
      command: 'tsc --noEmit',
      name: 'typescript-4.2',
      npm: {
        typescript: '~4.2',
      },
    },
    {
      command: 'tsc --noEmit',
      name: 'typescript-4.3',
      npm: {
        typescript: '~4.3',
      },
    },
    {
      command: 'tsc --noEmit',
      name: 'typescript-4.4',
      npm: {
        typescript: '~4.4',
      },
    },
    {
      command: 'tsc --noEmit',
      name: 'typescript-next',
      allowedToFail: true,
      npm: {
        devDependencies: {
          typescript: 'next',
        },
      },
    },
  ],
};
