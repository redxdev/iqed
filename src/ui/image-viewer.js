import jetpack from 'fs-jetpack';
import {getLayout, findAllComponents} from '../ui';

// TODO: Ctrl+W?

export default function (container, componentState) {
    if (componentState.filename === undefined) {
        this._filename = null;
    }
    else {
        this._filename = componentState.filename;
    }

    if (this._filename !== null) {
        if (jetpack.exists(this._filename) === false) {
            console.warn('Cannot open nonexistant file ' + this._filename + ' in the image viewer.');
        }
        else {
            var outer = document.createElement('div');
            outer.className = 'image-viewer allow-scroll';
            
            this._img = document.createElement('img');
            this._img.src = this._filename;
            outer.appendChild(this._img);

            container.getElement().append(outer);
        }
    }

    container.on('tab', (tab) => {
        var tabName = this._filename !== null ? this._filename.replace(/^.*[\\\/]/, '') : 'New Image';
        tab.setTitle(tabName);
    });
}

export function openImageViewer(layout, path) {
    var viewers = findAllComponents(layout, 'imageViewer');
    for (var i = 0; i < viewers.length; ++i) {
        var viewer = viewers[i];
        if (viewer.instance._filename !== null && path !== undefined && jetpack.path(viewer.instance._filename) == jetpack.path(path)) {
            viewer.parent.setActiveContentItem(viewer);
            return;
        }
    }

    var container = viewers.length > 0 ? viewers[0] : null;
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
        componentName: 'imageViewer',
        componentState: {filename: path}
    });
}