import jetpack from 'fs-jetpack';
import {ipcRenderer} from 'electron';
import {findAllComponents, getLayout} from '../ui';
import {executeString} from '../helpers/imqexec';
import {getLanguageFromPath} from '../helpers/filetype';
import {getModel} from './io-editor';

const remote = require('electron').remote;

export default function (container, componentState) {
    var language = componentState.language === undefined && componentState.filename !== undefined ? getLanguageFromPath(componentState.filename) : undefined;

    this._editor = monaco.editor.create(container.getElement().get(0), {
        theme: 'vs-dark',
        language: language
    });

    this._editor.addAction({
        id: 'close-editor',
        label: 'Close Editor',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_W],
        run: () => {
            var editors = findAllComponents(getLayout(), 'codeEditor');
            if (editors.length == 1) {
                openEditor(getLayout());
            }

            container.parent.remove();

            return null;
        }
    });

    this._editor.addAction({
        id: 'save-file',
        label: 'Save File',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
        run: (ed) => {
            if (this._filename === null)
                return this._editor.getAction('save-file-as').run(ed);

            return jetpack.writeAsync(this._filename, this._editor.getValue());
        }
    });

    this._editor.addAction({
        id: 'save-file-as',
        label: 'Save File As',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KEY_S],
        run: () => {
            var path = remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
                title: 'Save File As',
                defaultPath: this._filename === null ? undefined : this._filename
            });

            if (path === undefined)
                return null;

            this._filename = path;
            var tabName = this._filename.replace(/^.*[\\\/]/, '');
            container.tab.setTitle(tabName);

            return jetpack.writeAsync(this._filename, this._editor.getValue()).then(() => {
                monaco.editor.setModelLanguage(this._editor.getModel(), getLanguageFromPath(this._filename));
            }).catch((err) => {
                alert('Unable to save file ' + this._filename);
                console.error('Unable to save file ' + this._filename, err);
            });
        }
    });

    this._editor.addAction({
        id: 'execute',
        label: 'Execute Script',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_E],
        run: () => {
            var fileName = this._filename === null ? 'New File' : this._filename.replace(/^.*[\\\/]/, '');
            return new monaco.Promise((resolve, reject) => {
                executeString(fileName, this._editor.getValue(), getModel())
                    .then(() => {resolve();})
                    .catch((err) => {
                        if (err.getString)
                            reject(err.getString());
                        else
                            reject(err);
                    });
            });
        }
    })

    container.on('open', () => {
        this._editor.layout({width: container.width, height: container.height});
    });
    container.on('resize', () => {
        this._editor.layout({width: container.width, height: container.height});
    });
    container.on('show', () => {
        this._editor.focus();
    });

    if (componentState.filename !== undefined) {
        this._editor.updateOptions({readOnly: true});

        jetpack.existsAsync(componentState.filename)
            .then((result) => {
                if (result !== 'file') {
                    this._editor.updateOptions({readOnly: false});
                    console.warn('File "' + componentState.filename + '" does not exist or is not a file');
                }
                else {
                    jetpack.readAsync(componentState.filename)
                        .then((data) => {
                            this._editor.setValue(data);
                            this._editor.updateOptions({readOnly: false});
                        })
                        .catch((err) => {
                            this._editor.setValue('Unable to load "' + componentState.filename + '": ' + err);
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

ipcRenderer.on('file.save-all', function () {
    var editors = findAllComponents(getLayout(), 'codeEditor');
    editors.forEach(function (editor) {
        editor.instance._editor.getAction('save-file').run(editor.instance._editor);
    });
});