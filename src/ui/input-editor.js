import {ipcRenderer} from 'electron';
import {findFirstComponent, getLayout} from '../ui';
import settings from '../settings';

var model = settings.getSettings().inputs;
if (!model) {
    model = settings.getDefaultSettings().inputs;
    settings.getSettings().inputs = model;
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
        el.className = 'input-value';
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
        el.innerText = 'Not Supported';
        break;
    }

    el.className = 'input-value';

    return el;
}

function createRow(input) {
    var row = document.createElement('tr');

    var nameCol = document.createElement('td');
    row.appendChild(nameCol);

    var nameInput = document.createElement('input');
    nameInput.setAttribute('type', 'text');
    nameInput.className = 'input-name';
    nameInput.value = input.name;
    nameInput.onchange = (ev) => {
        input.name = ev.target.value;
    };
    nameCol.appendChild(nameInput);

    var typeCol = document.createElement('td');
    row.appendChild(typeCol);

    var typeInput = document.createElement('select');
    typeInput.className = 'input-type';
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

    var valueCol = document.createElement('td');
    row.appendChild(valueCol);

    valueCol.appendChild(createValueInput(input.type, input));

    var deleteCol = document.createElement('td');
    row.appendChild(deleteCol);

    var deleteButton = document.createElement('button');
    deleteButton.className = 'input-delete';
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
    addButton.className = 'input-add';
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
    root.className = 'input-editor allow-scroll';

    this._table = document.createElement('table');
    root.appendChild(this._table);

    container.getElement().append(root);

    updateFromModel(this._table);

    container.on('tab', (tab) => {
        tab.setTitle('Inputs');
    });
}

export function getInputs() {
    return model;
}

function openInputEditor(layout) {
    var container = findFirstComponent(layout, 'inputEditor');
    if (container === null) {
        container = layout.root;
        if (container.contentItems.length > 0)
            container = container.contentItems[0];

        container.addChild({
            type: 'component',
            componentName: 'inputEditor'
        });
    }
    else {
        container.parent.setActiveContentItem(container);
    }
}

ipcRenderer.on('view.input-editor.show', function () {
    openInputEditor(getLayout());
});