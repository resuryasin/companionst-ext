import * as vscode from 'vscode';

import { getBongoState } from './state';

class CompanionWebviewViewProvider implements vscode.WebviewViewProvider {
    constructor(private readonly context: vscode.ExtensionContext) {}
  
    public resolveWebviewView(
      webviewView: vscode.WebviewView
    ): void {
      webviewView.webview.options = {
        enableScripts: true,
      };
      webviewView.webview.html = this.getWebviewContent(this.context, webviewView.webview);
      
      const bongoFrameGenerator = getBongoState();

      let typeCommand = vscode.commands.registerCommand('type', (...args) => {
        webviewView.webview.postMessage(bongoFrameGenerator.next().value);
        return vscode.commands.executeCommand('default:type', ...args);
      });
      this.context.subscriptions.push(typeCommand);
      webviewView.webview.postMessage({ command: 'init', text: 'Ready to type!' });
  
      webviewView.onDidDispose(
        () => {
          typeCommand.dispose();
        },
        null,
        this.context.subscriptions
      );
    }
  
    private getWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview) {
      const bongoRightPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'bongo_right.png');
      const bongoLeftPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'bongo_left.png');
      const bongoMiddlePath = vscode.Uri.joinPath(context.extensionUri, 'media', 'bongo_middle.png');
      const bongoRightUri = webview.asWebviewUri(bongoRightPath);
      const bongoLeftUri = webview.asWebviewUri(bongoLeftPath);
      const bongoMiddleUri = webview.asWebviewUri(bongoMiddlePath);
      return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bongo Cat</title>
        </head>
        <body>
          <img id="bongo-middle" src=${bongoMiddleUri} width="100%"/>
          <img id="bongo-left" src=${bongoLeftUri} width="100%" hidden/>
          <img id="bongo-right" src=${bongoRightUri} width="100%" hidden/>
        </body>
        <script>
          const bongoLeft = document.getElementById('bongo-left');
          const bongoRight= document.getElementById('bongo-right');
          const bongoMiddle= document.getElementById('bongo-middle');
          let timeout;
    
          window.addEventListener('message', event => {
            const message = event.data;
            clearTimeout(timeout);
            if(message == 'left'){
              bongoMiddle.hidden = true;
              bongoLeft.hidden = false;
              bongoRight.hidden = true;
            }else{
              bongoMiddle.hidden = true;
              bongoLeft.hidden = true;
              bongoRight.hidden = false;
            }
            timeout = setTimeout(() => {bongoLeft.hidden = true; bongoRight.hidden = true; bongoMiddle.hidden = false; }, 200);
          });
        </script>
      </html>`;
    }
  }

export { CompanionWebviewViewProvider };