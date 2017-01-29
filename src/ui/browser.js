import jetpack from 'fs-jetpack';
import chokidar from 'chokidar';
import {openEditor} from './code-editor';
import {ipcRenderer} from 'electron';
import {getLayout, findFirstComponent} from '../ui';

function getFiles(tree, path, cb) {
    jetpack.listAsync(path)
        .then((files) => {
            var nodes = [];
            files.forEach((file) => {
                var type = jetpack.exists(jetpack.path(path, file));
                if (type === false) {
                    console.warn('Unable to determine type for ' + jetpack.path(path, file));
                    return;
                }

                var node = {
                    text: file,
                    type: type,
                    children: type === 'dir' ? true : undefined
                };

                nodes.push(node);
            });

            cb.call(tree, nodes);
        })
        .catch((err) => {
            console.error("Unable to list files for " + path, err);
        });
}

function buildPathFromNode(tree, root, obj) {
    var path = root;
    var parents = obj.parents.slice(0);
    parents.reverse();
    parents.forEach((parent) => {
        if (parent !== '#')
            path = jetpack.path(path, tree.get_node(parent).text);
    });
    return jetpack.path(path, obj.text);
}

export default function (container, componentState) {
    container.getElement().addClass('allow-scroll');

    var path = jetpack.cwd();
    if (componentState.path !== undefined) {
        path = componentState.path;
    }
    this._path = path;

    container.on('tab', function (tab) {
        tab.setTitle('Browser');
    });

    this._tree = container.getElement().jstree({
        plugins: ['sort', 'wholerow', 'types'],
        core: {
            themes: {
                name: 'default-dark',
                dots: true,
                icons: true
            },
            data: function (obj, cb) {
                var treePath;
                if (obj.id === '#')
                    treePath = path;
                else
                    treePath = buildPathFromNode(this, path, obj);

                getFiles(this, treePath, cb);
            }
        },
        types: {
            file: {
                icon: 'jstree-file'
            },
            dir: {
                icon: 'jstree-folder'
            }
        },
        sort: function (a, b) {
            var vA = 0;
            var vB = 0;
            var nodeA = this.get_node(a);
            var nodeB = this.get_node(b);

            if (nodeA.type === 'dir')
                vA = 1;

            if (nodeB.type === 'dir')
                vB = 1;

            if (vA > vB)
                return -1;
            else if (vA < vB)
                return 1;

            if (nodeA.text === nodeB.text)
                return 0;

            return nodeA.text.localeCompare(nodeB.text);
        },
    });

    this._tree.on('dblclick', '.jstree-anchor', function (e) {
        var instance = $.jstree.reference(this),
            node = instance.get_node(this);

        if (node.type !== 'file')
            return;

        var filePath = buildPathFromNode(instance, path, node);
        openEditor(container.layoutManager, filePath);
    });

    // TODO: This is a really inefficient way to deal with filesystem changes, especially on large directory trees.
    var watchCb = () => {this._tree.jstree('refresh')};
    var watcher = chokidar.watch(this._path, {ignoreInitial: true})
        .on('add', watchCb)
        .on('addDir', watchCb)
        .on('unlink', watchCb)
        .on('unlinkDir', watchCb);

    container.on('destroy', () => {
        watcher.close();
    });
};

export function openBrowser(layout, path) {
    var container = findFirstComponent(layout, 'browser');
    if (container === null) {
        container = layout.root;
        if (container.contentItems.length > 0)
            container = container.contentItems[0];

        container.addChild({
            type: 'component',
            componentName: 'browser',
            componentState: {filename: path}
        });
    }
    else {
        if (path === undefined)
            return;

        container.parent.replaceChild(container, {
            type: 'component',
            componentName: 'browser',
            componentState: {path: path}
        });
    }
}

ipcRenderer.on('view.browser.show', function () {
    openBrowser(getLayout());
});

ipcRenderer.on('file.open-directory', function (emitter, dir) {
    openBrowser(getLayout(), dir);
});