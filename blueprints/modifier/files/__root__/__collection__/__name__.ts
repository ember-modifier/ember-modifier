<% if (modifierType === 'function') { %>import { modifier } from 'ember-modifier';
<% } else { %>import Modifier, { type NamedArgs, type PositionalArgs } from 'ember-modifier';
<% } %>
interface <%= classifiedModuleName %>Signature {
  // TODO: Specify the correct `Element` type:
  Element: Element;
  Args: {
    Named: {};
    Positional: [];
  };
}
<% if (modifierType === 'function') { %>
export default modifier<<%= classifiedModuleName %>Signature>(function <%= camelizedModuleName %>(element/*, positional, named*/) {});<% } else { %>
export default class <%= classifiedModuleName %>Modifier extends Modifier<<%= classifiedModuleName %>Signature> {
  modify(
    element: <%= classifiedModuleName %>Signature['Element'],
    positional: PositionalArgs<<%= classifiedModuleName %>Signature>,
    named: NamedArgs<<%= classifiedModuleName %>Signature>,
  ) {}
}<% } %>
