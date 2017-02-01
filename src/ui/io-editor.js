import {ipcRenderer} from 'electron';
import {findFirstComponent, getLayout} from '../ui';
import settings from '../settings';

const {dialog, BrowserWindow} = require('electron').remote;

var model = settings.getSettings().io;
if (!model) {
    model = settings.getDefaultSettings().io;
    settings.getSettings().io = model;
}

function createOption(parent, name, value, select) {
    var opt = document.createElement('option');
    opt.value = value;
    opt.innerText = name;
    if (select === opt.value)
        opt.setAttribute('selected', true);
    parent.appendChild(opt);
}

function createValueInput(type, input) {
    var el;
    switch (type) {
    case 'nil':
        el = document.createElement('p');
        el.innerText = 'Nil';
        break;

    case 'bool':
        el = document.createElement('select');
        createOption(el, 'false', 'false', input.value);
        createOption(el, 'true', 'true', input.value);
        el.onchange = (ev) => {
            input.value = ev.target.value;
        };
        break;

    case 'integer':
        el = document.createElement('input');
        el.setAttribute('type', 'number');
        el.setAttribute('step', '1');
        el.value = input.value;
        el.onchange = (ev) => {
            input.value = ev.target.value;
        };
        break;

    case 'float':
        el = document.createElement('input');
        el.setAttribute('type', 'number');
        el.value = input.value;
        el.onchange = (ev) => {
            input.value = ev.target.value;
        };
        break;

    case 'string':
        el = document.createElement('input');
        el.setAttribute('type', 'text');
        el.value = input.value;
        el.onchange = (ev) => {
            input.value = ev.target.value;
        };
        break;

    case 'image':
        el = document.createElement('p');
        var p = document.createElement('a');
        p.className = 'io-file-value';
        p.innerText = 'File: ' + input.value.replace(/^.*[\\\/]/, '');
        p.onclick = (ev) => {
            var file = dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
                filters: [{name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg', 'tga']}, {name: 'All Files', extensions: ['*']}],
                properties: ['openFile'],
                defaultPath: input.value
            });

            if (!file || file.length < 1)
                return;

            input.value = file[0];
            ev.target.innerText = 'File: ' + input.value.replace(/^.*[\\\/]/, '');
        };
        el.appendChild(p);
        break;

    case 'image-output':
        el = document.createElement('p');
        var p = document.createElement('a');
        p.className = 'io-file-value';
        p.innerText = 'File: ' + input.value.replace(/^.*[\\\/]/, '');
        p.onclick = (ev) => {
            var file = dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
                filters: [{name: 'PNG Image', extensions: ['png']}, {name: 'All Files', extensions: ['*']}],
                defaultPath: input.value
            });

            if (!file)
                return;

            input.value = file;
            ev.target.innerText = 'File: ' + input.value.replace(/^.*[\\\/]/, '');
        };
        el.appendChild(p);
        break;

    default:
        el = document.createElement('p');
        el.innerText = 'Unsupported Type';
        break;
    }

    el.className = 'io-value';

    return el;
}

function createRow(input) {
    var row = document.createElement('tr');

    var nameCol = document.createElement('td');
    row.appendChild(nameCol);

    var nameInput = document.createElement('input');
    nameInput.setAttribute('type', 'text');
    nameInput.className = 'io-name';
    nameInput.value = input.name;
    nameInput.onchange = (ev) => {
        input.name = ev.target.value;
    };
    nameCol.appendChild(nameInput);

    var typeCol = document.createElement('td');
    row.appendChild(typeCol);

    var typeInput = document.createElement('select');
    typeInput.className = 'io-type';
    typeInput.onchange = (ev) => {
        input.type = ev.target.value;
        var newRow = createRow(input);
        row.parentNode.replaceChild(newRow, row);
    };
    typeCol.appendChild(typeInput);

    createOption(typeInput, 'Nil', 'nil', input.type);
    createOption(typeInput, 'Bool', 'bool', input.type);
    createOption(typeInput, 'Integer', 'integer', input.type);
    createOption(typeInput, 'Float', 'float', input.type);
    createOption(typeInput, 'String', 'string', input.type);
    createOption(typeInput, 'Image', 'image', input.type);
    createOption(typeInput, 'Image Output', 'image-output', input.type);

    var valueCol = document.createElement('td');
    row.appendChild(valueCol);

    valueCol.appendChild(createValueInput(input.type, input));

    var deleteCol = document.createElement('td');
    row.appendChild(deleteCol);

    var deleteButton = document.createElement('button');
    deleteButton.className = 'io-delete';
    deleteButton.innerText = '-';
    deleteButton.onclick = () => {
        var idx = model.indexOf(input);
        if (idx > -1) {
            model.splice(idx);
        }

        row.parentNode.removeChild(row);
    };
    deleteCol.appendChild(deleteButton);

    return row;
}

function updateFromModel(table) {
    while (table.hasChildNodes()) {
        table.removeChild(table.lastChild);
    }

    var head = document.createElement('thead');
    head.innerHTML = "<tr><th>Name</th><th>Type</th><th>Value</th></tr>";
    table.appendChild(head);

    var body = document.createElement('tbody');
    table.appendChild(body);

    for (var i = 0; i < model.length; ++i) {
        var item = model[i];
        body.appendChild(createRow(item));
    }

    var lastRow = document.createElement('tr');
    body.appendChild(lastRow);

    var addCol = document.createElement('td');
    lastRow.appendChild(addCol);

    var addButton = document.createElement('button');
    addButton.className = 'io-add';
    addButton.innerText = '+';
    addButton.onclick = () => {
        var input = {name: '', type: 'nil', value: ''};
        model.push(input);
        body.insertBefore(createRow(input), lastRow);
    };
    addCol.appendChild(addButton);
}

export default function (container, componentState) {
    var root = document.createElement('div');
    root.className = 'io-editor allow-scroll';

    this._table = document.createElement('table');
    root.appendChild(this._table);

    container.getElement().append(root);

    updateFromModel(this._table);

    container.on('tab', (tab) => {
        tab.setTitle('IO Editor');
    });
}

export function getModel() {
    return model;
}

function openIOEditor(layout) {
    var container = findFirstComponent(layout, 'ioEditor');
    if (container === null) {
        container = layout.root;
        if (container.contentItems.length > 0)
            container = container.contentItems[0];

        container.addChild({
            type: 'component',
            componentName: 'ioEditor'
        });
    }
    else {
        container.parent.setActiveContentItem(container);
    }
}

ipcRenderer.on('view.io-editor.show', function () {
    openIOEditor(getLayout());
});