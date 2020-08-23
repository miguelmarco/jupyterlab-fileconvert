import { JupyterFrontEnd, JupyterFrontEndPlugin} from '@jupyterlab/application';
import { showDialog, Dialog } from '@jupyterlab/apputils';
import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { Menu } from '@lumino/widgets';

namespace CommandIDs {
    export const convert: string = 'context-menu:convert-to-ipynb';
};

/**
 * Initialization data for the fileconvert extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'fileconvert',
  autoStart: true,
  requires: [IFileBrowserFactory],
  activate: (app: JupyterFrontEnd,  factory: IFileBrowserFactory) => {
    console.log('JupyterLab extension fileconvert is activated!');
    app.docRegistry.addFileType({
      name: 'sws',
      displayName: 'Sage Worksheet',
      extensions: ['.sws'],
      contentType: 'file'
    });





    app.commands.addCommand(CommandIDs.convert, {
        label: '.ipynb',
        caption: 'Convert file to ipynb format',
        execute: () => {
            return showDialog({
                title: 'Convert file',
                body: 'Convert file?',
                buttons: [
                    Dialog.cancelButton(),
                    Dialog.okButton()
                ]
            }).then(result => {
                    if (result.button.accept)

                        {
        //             const file = factory.tracker.currentWidget.selectedItems().next();

                        let leftSidebarItems = app.shell.widgets('left');
                        let fileBrowser = leftSidebarItems.next();
                        let selecteditems = (fileBrowser as any).selectedItems();
                        let filepath = selecteditems.next().path;
                        console.log("En ConvertForm: ");
                        console.log("baseurl: ", URLExt.join(ServerConnection.makeSettings().baseUrl));
                        let fullUrl = URLExt.join(ServerConnection.makeSettings().baseUrl, 'convert');
                        let fullRequest = {
                        method: 'POST',
                        body: JSON.stringify({path: filepath, format: 'ipynb'})
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
                        }).then(response => {
                            console.log(app.shell.widgets('left').next());
                            let fBrowser = app.shell.widgets('left').next();
                            (fBrowser as any).model.refresh();
                        });
                        return true;
                    }
                    else {
                        return false;
                    }
                })
        }
    })


    const { commands } = app;
    const convertMenu: Menu = new Menu({ commands });
    convertMenu.title.label = 'Convert to';


    convertMenu.addItem({
        command: CommandIDs.convert
    });

    app.contextMenu.addItem({
        type: 'submenu',
        submenu: convertMenu,
        selector: '.jp-DirListing-item[data-file-type="sws"]',
        rank: 80
    });
  }
};

export default extension;
