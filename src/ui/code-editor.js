import jetpack from 'fs-jetpack';

export default function (container, componentState) {
    this.editor = monaco.editor.create(container.getElement().get(0), {
        theme: 'vs-dark'
    });

    this.editor.layout();
    container.on('resize', () => {
        this.editor.layout();
    });

    if (componentState.filename !== undefined) {
        this.editor.updateOptions({readOnly: true});

        jetpack.existsAsync(componentState.filename)
            .then((result) => {
                if (result !== 'file') {
                    this.editor.updateOptions({readOnly: false});
                    console.log('File "' + componentState.filename + '" does not exist or is not a file');
                }
                else {
                    jetpack.readAsync(componentState.filename)
                        .then((data) => {
                            this.editor.setValue(data);
                            this.editor.updateOptions({readOnly: false});
                        })
                        .catch((err) => {
                            this.editor.setValue('Unable to load "' + componentState.filename + '": ' + err);
                            console.log('Unable to load "' + componentState.filename + '"', err);
                        });
                }
            });
    }

    container.on('tab', (tab) => {
        if (componentState.filename === undefined)
        {
            tab.setTitle('New File');
        }
        else
        {
            tab.setTitle(componentState.filename);
        }
    });
}