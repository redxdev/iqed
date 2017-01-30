import jetpack from 'fs-jetpack';
import {ipcRenderer} from 'electron';
import {findAllComponents, getLayout} from '../ui';
const remote = require('electron').remote;

export default function (container, componentState) {
    this.editor = monaco.editor.create(container.getElement().get(0), {
        theme: 'vs-dark'
    });

    this.editor.addAction({
        id: 'close-editor',
        label: 'Close Editor',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_W],
        run: () => {
            container.parent.remove();
            return null;
        }
    });

    this.editor.addAction({
        id: 'save-file',
        label: 'Save File',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
        run: (ed) => {
            if (this._filename === null)
                return this.editor.getAction('save-file-as').run(ed);

            return jetpack.writeAsync(this._filename, this.editor.getValue());
        }
    });

    this.editor.addAction({
        id: 'save-file-as',
        label: 'Save File As',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_S],
        run: () => {
            var path = remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
                title: 'Save File As',
                defaultPath: this._filename === null ? undefined : this._filename
            });

            this._filename = path;
            var tabName = this._filename.replace(/^.*[\\\/]/, '');
            container.tab.setTitle(tabName);

            return jetpack.writeAsync(this._filename, this.editor.getValue());
        }
    });

    this.editor.layout();
    container.on('resize', () => {
        this.editor.layout({width: container.width, height: container.height});
    });

    if (componentState.filename !== undefined) {
        this.editor.updateOptions({readOnly: true});

        jetpack.existsAsync(componentState.filename)
            .then((result) => {
                if (result !== 'file') {
                    this.editor.updateOptions({readOnly: false});
                    console.warn('File "' + componentState.filename + '" does not exist or is not a file');
                }
                else {
                    jetpack.readAsync(componentState.filename)
                        .then((data) => {
                            this.editor.setValue(data);
                            this.editor.updateOptions({readOnly: false});
                        })
                        .catch((err) => {
                            this.editor.setValue('Unable to load "' + componentState.filename + '": ' + err);
                            console.warn('Unable to load "' + componentState.filename + '"', err);
                        });
                }
            });
    }

    this._filename = componentState.filename !== undefined ? jetpack.path(componentState.filename) : null;

    container.on('tab', (tab) => {
        var tabName = this._filename !== null ? this._filename.replace(/^.*[\\\/]/, '') : 'New File';
        tab.setTitle(tabName);
    });
};

export function openEditor(layout, path) {
    var editors = findAllComponents(layout, 'codeEditor');
    for (var i = 0; i < editors.length; ++i) {
        var editor = editors[i];
        if (editor.instance._filename !== null && path !== undefined && jetpack.path(editor.instance._filename) === jetpack.path(path)) {
            editor.parent.setActiveContentItem(editor);
            return;
        }
    }

    var container = editors.length > 0 ? editors[0] : null;
    if (container === null) {
        container = layout.root;
        if (container.contentItems.length > 0)
            container = container.contentItems[0];
    }
    else {
        container = container.parent;
    }

    container.addChild({
        type: 'component',
        componentName: 'codeEditor',
        componentState: {filename: path}
    });
}

ipcRenderer.on('file.new', function () {
    openEditor(getLayout());
});

ipcRenderer.on('file.open-file', function (emitter, filename) {
    openEditor(getLayout(), filename);
});