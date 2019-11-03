import ApplicationInstance from '@ember/application/instance';

export type ModifierFactory<Klass> = {
  class: Klass;
  owner: ApplicationInstance;
}

export interface ModifierArgs {
  positional: unknown[];
  named: { [key: string]: unknown };
}

