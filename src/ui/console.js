import {ipcRenderer} from 'electron';
import {findFirstComponent, getLayout} from '../ui';

var consoleBuffer = '';
var currentInst = null;

let consoleImpl = {
    append: function (data) {
        consoleBuffer = consoleBuffer + data;
        if (currentInst !== null) {
            currentInst._editor.setValue(consoleBuffer);
            currentInst._editor.revealLine(currentInst._editor.getModel().getLineCount());
        }
    },
    print: function (data) {
        consoleImpl.append(data + '\n');
    },
    getComponent: function () {
        return currentInst;
    }
}

export function getConsole() {
    return consoleImpl;
}

export default function (container, componentState) {
    if (currentInst !== null)
        throw new Error("Cannot create a new Console instance when one already exists.");

    currentInst = this;
    this._editor = monaco.editor.create(container.getElement().get(0), {
        theme: 'vs-dark',
        readOnly: true,
        lineNumbers: false,
    });

    this._editor.layout();
    container.on('resize', () => {
        this._editor.layout({width: container.width, height: container.height});
    });

    container.on('tab', (tab) => {
        tab.setTitle('Console');
    });

    container.on('destroy', () => {
        currentInst = null;
    });

    this._editor.setValue(consoleBuffer);
};

export function openConsole(layout) {
    var container = findFirstComponent(layout, 'console');
    if (container === null) {
        container = layout.root;
        if (container.contentItems.length > 0)
            container = container.contentItems[0];

        container.addChild({
            type: 'component',
            componentName: 'console'
        });
    }
    else {
        container.parent.setActiveContentItem(container);
    }
}

ipcRenderer.on('view.console.show', function () {
    openConsole(getLayout());
})