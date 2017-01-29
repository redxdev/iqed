import GoldenLayout from 'golden-layout';
import $ from 'jquery';
import codeEditor from './ui/code-editor';

var layout = null;

export function getLayout() {
    return layout;
}

export function getDefaultContent() {
    return [{
        type: 'row',
        content: [{
            type: 'component',
            componentName: 'codeEditor',
            componentState: {filename: 'foobar.txt'}
        }, {
            type: 'column',
            content: [{
                type: 'component',
                componentName: 'testComponent',
                componentState: {label: 'B'}
            }, {
                type: 'component',
                componentName: 'testComponent',
                componentState: {label: 'C'}
            }]
        }]
    }];
}

export function init() {
    if (layout !== null) {
        throw new Error("UI Layout already initialized, cannot call init() again!");
    }

    layout = new GoldenLayout({
        content: getDefaultContent(),
        settings: {
            showPopoutIcon: false,
        }
    });

    // TODO: remove
    layout.registerComponent('testComponent', function (container, componentState) {
        container.getElement().html('<h2>' + componentState.label + '</h2>');
    });

    layout.registerComponent('codeEditor', codeEditor);

    layout.init();
}

export default {
    init: init,
    getLayout: getLayout,
    getDefaultContent: getDefaultContent,
};