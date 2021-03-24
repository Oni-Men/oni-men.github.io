export class CommandCD {
	getLabel() {
		return "cd";
	}

	getUsage() {
		return "cd [dir]";
	}

	execute(println, system, args) {
		const path = (() => {
			if (args.length == 0) {
				return system.path;
			} else {
				return system.resolvePath(args[0]);
			}
		})();

		if (path === "/") {
			system.path = path;
		} else if (system.direcotries.find((p) => p === `${path}/`)) {
			system.path = path;
		} else {
			println("No such file or directory");
		}
		return false;
	}
}
