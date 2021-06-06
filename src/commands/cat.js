export class CommandCat {
	getLabel() {
		return "cat";
	}

	getUsage() {
		return "cat [file]";
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
			if (path.endsWith(".link")) {
				println("use: open [file]");
				return;
			}

			file.split("\n").forEach((line) => {
				println(line);
			});
		} else {
			println("No such file or directory");
		}
		return false;
	}
}
