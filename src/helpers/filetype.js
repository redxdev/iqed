import path from 'path';
import {getLayout} from '../ui';
import {openEditor} from '../ui/code-editor';

export function getLanguageFromPath(filepath) {
    var ext = path.extname(filepath);
    switch (ext) {
    case '.imq':
        return 'imquery';

    default:
        return null;
    }
}

export function openEditorForPath(filepath) {
    switch (getLanguageFromPath(filepath)) {
    default:
        openEditor(getLayout(), filepath);
        break;
    }
}