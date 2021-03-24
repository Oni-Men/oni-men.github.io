import App from "./App.svelte";
import { System } from "./system";
import { CommandLS } from "./commands/ls";
import { CommandCD } from "./commands/cd";
import { CommandCat } from "./commands/cat";
import { CommandOpen } from "./commands/open";
import { CommandHelp } from "./commands/help";
import { CommandClear } from "./commands/clear";

export const commands = {};

function registerCommand(command) {
	commands[command.getLabel()] = command;
}

registerCommand(new CommandLS());
registerCommand(new CommandCD());
registerCommand(new CommandCat());
registerCommand(new CommandOpen());
registerCommand(new CommandHelp());
registerCommand(new CommandClear());

const app = new App({
	target: document.body,
	props: {
		system: new System(),
		commands,
	},
});

export default app;
