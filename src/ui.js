import GoldenLayout from 'golden-layout';
import $ from 'jquery';
import {ipcRenderer} from 'electron';

import settings from './settings';

import codeEditor from './ui/code-editor';
import browser from './ui/browser';
import consoleUI from './ui/console';

var layout = null;

export function getLayout() {
    return layout;
}

export function getDefaultContent() {
    return [{
        type: 'row',
        content: [{
            type: 'component',
            componentName: 'browser',
            width: 20
        }, {
            type: 'column',
            content: [{
                type: 'component',
                componentName: 'codeEditor',
            }, {
                type: 'component',
                componentName: 'console',
                height: 30
            }]
        }]
    }];
}

export function init(content) {
    if (layout !== null) {
        throw new Error("UI Layout already initialized, cannot call init() again!");
    }

    if (content === undefined) {
        content = settings.getSettings().layout;
    }

    layout = new GoldenLayout({
        content: content,
        settings: {
            showPopoutIcon: false,
        }
    });

    // TODO: remove
    layout.registerComponent('testComponent', function (container, componentState) {
        container.getElement().html('<h2>' + componentState.label + '</h2>');
    });

    layout.registerComponent('codeEditor', codeEditor);
    layout.registerComponent('browser', browser);
    layout.registerComponent('console', consoleUI);

    layout.init();
}

export function resetLayout(force) {
    if (force === true || confirm('Are you sure you want to reset the editor layout? You will lose any unsaved work!')) {
        layout.destroy();
        layout = null;
        init(getDefaultContent());
    }
}

export function findFirstComponent(layout, componentName) {
    var stack = [layout.root];
    var found = null;
    while (stack.length > 0 && found === null) {
        var current = stack[0];
        if (current.type === 'component' && current.componentName === componentName) {
            found = current;
            break;
        }

        stack.shift();
        if (current.contentItems !== undefined)
            stack = stack.concat(current.contentItems);
    }

    return found;
}

export function findAllComponents(layout, componentName) {
    var stack = [layout.root];
    var found = [];
    while (stack.length > 0) {
        var current = stack[0];
        if (current.type === 'component' && current.componentName === componentName) {
            found.push(current);
        }

        stack.shift();
        if (current.contentItems !== undefined)
            stack = stack.concat(current.contentItems);
    }

    return found;
}

export default {
    init: init,
    getLayout: getLayout,
    getDefaultContent: getDefaultContent,
    findFirstComponent: findFirstComponent,
    findAllComponents: findAllComponents,
    resetLayout: resetLayout,
};

ipcRenderer.on('view.reset-layout', function () {
    resetLayout();
});