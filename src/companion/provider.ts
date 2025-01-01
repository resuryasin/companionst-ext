import * as vscode from 'vscode';

import { BongoState } from './state';

class CompanionWebviewViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly context: vscode.ExtensionContext) { }

  public resolveWebviewView(
    webviewView: vscode.WebviewView
  ): void {
    webviewView.webview.options = {
      enableScripts: true,
    };
    webviewView.webview.html = this.getWebviewContent(this.context, webviewView.webview);

    const typingListener = vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;

      const leftSideRegex = /^[qwertasdfzxcvb12345!@#$%`~]|(\t)$/i;
      const rightSideRegex = /^[yuiophjkl;'nm,<>.\/:"?67890^&*-=_+ \}\]\)]|(\[\]|\{\}|\(\)|\n|\r)$/i;

      if (editor && event.document === editor.document) {
        const changes = event.contentChanges;

        if (changes.length > 0) {
          const textChange = changes[0];

          if (textChange.text.length > 0) {
            const typedChar = textChange.text;
            if (leftSideRegex.test(typedChar)) {
              webviewView.webview.postMessage(BongoState.LEFT.toString());
            } else if (rightSideRegex.test(typedChar)) {
              webviewView.webview.postMessage(BongoState.RIGHT.toString());
            }

            vscode.window.showInformationMessage('Typing detected!');
          }
        }
      }
    });


    this.context.subscriptions.push(typingListener);
    webviewView.webview.postMessage({ command: 'init', text: 'Ready to type!' });

    webviewView.onDidDispose(
      () => {
        typingListener.dispose();
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
            timeout = setTimeout(() => {bongoLeft.hidden = true; bongoRight.hidden = true; bongoMiddle.hidden = false; }, 100);
          });
        </script>
      </html>`;
  }
}

export { CompanionWebviewViewProvider };