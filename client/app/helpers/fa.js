import Ember from 'ember';

export function fa(params/*, hash*/) {
  const [ icon ] = params;
  return icon ?
    Ember.String.htmlSafe(`<i class="fa fa-${icon}"></i>`) :
    '';
}

export default Ember.Helper.helper(fa);
