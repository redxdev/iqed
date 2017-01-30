import {ipcRenderer} from 'electron';
import {findFirstComponent, getLayout} from '../ui';

var currentInst = null;

export function getConsole() {
    // todo: store console data in a buffer
    if (currentInst === null)
        return {
            append: function () {},
            print: function () {},
            clear: function () {}
        };

    return currentInst;
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

    this._editor.addAction({
        id: 'clear-console',
        label: 'Clear Console',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KEY_C],
        run: () => {
            this.clear();
        }
    })

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

    this.append = (data) => {
        var shouldScroll = true;
        /*
        if (this._editor.getSelections().length > 1)
            shouldScroll = false;
        else {
            var selection = this._editor.getSelection();
            if (!selection.getStartPosition().equals(selection.getEndPosition()) ||
                !this._editor.getPosition().equals())
                shouldScroll = false;
        }
        */

        this._editor.setValue(this._editor.getValue() + data);
        if (shouldScroll) {
            this._editor.revealLine(this._editor.getModel().getLineCount());
        }
    }

    this.print = (data) => {
        this.append(data + '\n');
    }

    this.clear = () => {
        this._editor.setValue('');
    }
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