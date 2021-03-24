export class CommandOpen {
	getLabel() {
		return "open";
	}

	getUsage() {
		return "open [dir]";
	}

	execute(println, system, args) {
		const path = (() => {
			if (args.length == 0) {
				return system.path;
			} else {
				return system.resolvePath(args[0]);
			}
		})();

		const file = system.files[path];
		if (file) {
			if (path.endsWith(".txt")) {
				println("use: cat [file]");
				return;
			}
			window.open(file);
		} else {
			println("No such file or directory");
		}
		return false;
	}
}
