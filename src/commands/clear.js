export class CommandClear {
	getLabel() {
		return "clear";
	}

	getUsage() {
		return "clear";
	}

	execute(println, system, args) {
		println("\u007F");
		return true;
	}
}
