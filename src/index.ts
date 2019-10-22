import { Menu, Widget } from '@phosphor/widgets';
import { JupyterFrontEnd, JupyterFrontEndPlugin} from '@jupyterlab/application';
import { showDialog, Dialog } from '@jupyterlab/apputils';
import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';

namespace CommandIDs {
    export const convert: string = 'convert';
};

/**
 * Initialization data for the fileconvert extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'fileconvert',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension fileconvert is activated!');



    class ConvertForm extends Widget {
        /**
         * Create a redirect form.
         */
        constructor() {
            super({node: ConvertForm.createFormNode()});
        }

        private static createFormNode(): HTMLElement {
            const node = document.createElement('div');
            const label = document.createElement('label');
            const text = document.createElement('span');
            const warning = document.createElement('div');

            node.className = 'jp-ConvertForm';
            warning.className = 'jp-ConvertForm-warning';
            let leftSidebarItems = app.shell.widgets('left');
            let fileBrowser = leftSidebarItems.next();
            let selecteditems = (fileBrowser as any).selectedItems();
            let filepath = selecteditems.next().path;
//             var path : string = (app.shell.currentWidget as FileBrowser).context.path;
            text.textContent = `Convert ${filepath} to ipynb?`;

            label.appendChild(text);
            node.appendChild(label);
            node.appendChild(warning);
            return node;
        }

        /**
         * Returns the input value.
         */
        getValue(): string {
            let leftSidebarItems = app.shell.widgets('left');
            let fileBrowser = leftSidebarItems.next();
            let selecteditems = (fileBrowser as any).selectedItems();
            let filepath = selecteditems.next().path;
            console.log("En ConvertForm: ");
            console.log("baseurl: ", URLExt.join(ServerConnection.makeSettings().baseUrl));
            let fullUrl = URLExt.join(ServerConnection.makeSettings().baseUrl, 'convert');
            let fullRequest = {
              method: 'POST',
              body: JSON.stringify({path: filepath})
              };
            var resul = ServerConnection.makeRequest(fullUrl, fullRequest, ServerConnection.makeSettings()).then(response => {
                if (response.status !== 200) {
                    return response.text().then(data => {
                        throw new ServerConnection.ResponseError(response, data);
                        });
                  }
                return response.text();
                });
            resul.then(response => {
                console.log("respose: ", response)
                showDialog({
                    title: 'Convert file',
                    body: response,
                    buttons: [
                    Dialog.okButton({label : "OK"})
                    ]
                });
            });
            return ;
        }
    }


    app.commands.addCommand(CommandIDs.convert, {
        label: 'ipynb',
        caption: 'Convert file to ipynb format',
        execute: () => {
            return showDialog({
                title: 'Convert File',
                body: new ConvertForm(),
                              buttons: [
                              Dialog.okButton({label : "OK"}),
                              Dialog.cancelButton({label: "Cancel"})
                              ]
            });
            console.log('fileconvert!');
        },
    });


    const { commands } = app;

    let menu = new Menu({ commands });
    const category = 'Convert to';
    menu.title.label = category;
    [
    CommandIDs.convert,
    ].forEach(command => {
        menu.addItem({ command });
    });

    app.contextMenu.addItem({
        type: 'submenu',
        submenu: menu,
        selector: '.jp-DirListing-item[title$=".sws"]',
        rank: 100
    });

  }
};

export default extension;
