export class CommandLS {
	getLabel() {
		return "ls";
	}

	getUsage() {
		return "ls [dir]";
	}

	execute(println, system, args) {
		const path = (() => {
			if (args.length == 0) {
				return system.path;
			} else {
				return system.resolvePath(args[0]);
			}
		})();

		if (path !== "/" && !system.direcotries.find((p) => p === `${path}/`)) {
			return false;
		}

		const files = system.allFiles
			.filter((p) => p.startsWith(path))
			.filter((p) => system.allFiles.includes(p))
			.map((p) => p.slice(path.length))
			.filter((p) => p.split("/").filter((s) => s).length === 1);

		if (files.length) {
			println(files.join(", "));
			return true;
		}
		return false;
	}
}
