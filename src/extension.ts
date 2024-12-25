import * as vscode from 'vscode';
import { CompanionWebviewViewProvider } from './companion/provider';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "companionst" is now active!');
	const provider = new CompanionWebviewViewProvider(context);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('companionst.cview', provider)
	);
}

export function deactivate() {}
