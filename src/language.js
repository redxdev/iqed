import syntax from './language/syntax';

export function init() {
    monaco.languages.register({id: 'imquery'});
    monaco.languages.setMonarchTokensProvider('imquery', syntax);
};

export default {
    init: init
};