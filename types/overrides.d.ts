import '@ember/component';
// TODO: upstream this to DefinitelyTyped [once the item is documented][docs]
//
// [issue]: https://github.com/typed-ember/ember-cli-typescript/issues/1141
declare module '@ember/component' {
  export function setComponentTemplate(
    template: TemplateFactory,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    klass: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any;
}
