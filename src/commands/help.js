import { commands } from "../main";

export class CommandHelp {
	getLabel() {
		return "help";
	}

	getUsage() {
		return "help";
	}

	execute(println) {
		for (const command of Object.values(commands)) {
			println(command.getUsage());
		}
	}
}
