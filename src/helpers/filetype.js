import path from 'path';
import {getLayout} from '../ui';
import {openEditor} from '../ui/code-editor';
import {openImageViewer} from '../ui/image-viewer';

export function getLanguageFromPath(filepath) {
    var ext = path.extname(filepath);
    switch (ext) {
    case '.imq':
        return 'imquery';

    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.tga':
    case '.gif':
        return 'image';

    default:
        return null;
    }
}

export function openEditorForPath(filepath) {
    switch (getLanguageFromPath(filepath)) {
    default:
        openEditor(getLayout(), filepath);
        break;

    case 'image':
        openImageViewer(getLayout(), filepath);
        break;
    }
}