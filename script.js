const app = document.querySelector("#app");
const system = {
	username: "guest@ONIX-PC",
	currentPath: "/",
	direcotries: ["/"],
	files: {},
	history: {
		commands: [],
		pos: 0,
	},
	get allFiles() {
		return this.direcotries.concat(Object.keys(this.files));
	},
};

const commands = {
	ls(args) {
		const path = (() => {
			if (args.length == 0) {
				return system.currentPath;
			} else {
				return resolvePath(args[0]);
			}
		})();

		if (path !== "/" && !system.direcotries.find((p) => p === `${path}/`)) {
			return;
		}

		const files = system.allFiles
			.filter((p) => p.startsWith(path))
			.filter((p) => system.allFiles.includes(p))
			.map((p) => p.slice(path.length))
			.filter((p) => p.split("/").filter((s) => s).length === 1);

		if (files.length) {
			println(files.join(", "));
		}
	},
	cd(args) {
		const path = (() => {
			if (args.length == 0) {
				return system.currentPath;
			} else {
				return resolvePath(args[0]);
			}
		})();

		if (path === "/") {
			system.currentPath = path;
		} else if (system.direcotries.find((p) => p === `${path}/`)) {
			system.currentPath = path;
		} else {
			println("No such file or directory");
		}
	},
	clear() {
		app.innerHTML = "";
	},
	cat(args) {
		const path = (() => {
			if (args.length == 0) {
				return system.currentPath;
			} else {
				return resolvePath(args[0]);
			}
		})();

		const file = system.files[path];
		if (file) {
			if (path.endsWith(".link")) {
				println("use: open [file]");
				return;
			}
			println(file);
		} else {
			println("No such file or directory");
		}
	},
	open(args) {
		const path = (() => {
			if (args.length == 0) {
				return system.currentPath;
			} else {
				return resolvePath(args[0]);
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
	},
	mkdir(args) {
		if (args.length == 0) {
			println("missing operand");
			return;
		}

		const path = `${resolvePath(args[0])}/`;

		if (!system.direcotries[path]) {
			system.direcotries.push(path);
		}
	},
	history() {
		for (command of system.history.commands) {
			println(command);
		}
	},
	date() {
		println(new Date().toUTCString());
	},
	shutdown() {
		commands["clear"]();
		window.setTimeout(() => {
			window.close();
		}, 3000);
	},
	help() {
		println("ls [dir],\ncd [dir],\ncat [file],\nopen [file],\nclear,");
	},
};

const completers = {
	ls(args) {
		commands["ls"](args);
	},
	cd(args) {
		commands["ls"](args);
	},
	cat(args) {
		commands["ls"](args);
	},
	open(args) {
		commands["ls"](args);
	},
};

function filterOptions(args) {
	const options = [];

	for (let i = 0; i < args.length; i++) {
		if (args[i].startsWith("-")) {
			options.push(...args.splice(i, 1));
		}
	}

	return options;
}

/*
when current path is "/"
	"./about" will be 					"/about"
	"./about/about.txt" will be "/about/about.txt"

when current path is "/about"
	"./about.txt" will be "/about/about.txt"
	"../about" will be 		"/about"
*/
function resolvePath(path) {
	//開始文字列が「./」、「/」、「../」のいずれでもない場合、「./」を付与する
	if (!/^(\/|\.{1,2}\/).*$/.test(path)) {
		path = `./${path}`;
	}

	const names = path.split("/");
	const currents = system.currentPath === "/" ? [""] : system.currentPath.split("/");

	if (names.length) {
		if (names[0] === ".") {
			names.splice(0, 1, ...currents);
		} else {
			if (names[0] === "..") {
				while (names.length && names[0] === "..") {
					names.shift();
					currents.pop();
				}
				names.unshift(...currents);
			}
		}
	}

	path = names.join("/");
	return path;
}

function prefix() {
	const user = document.createElement("span");
	const path = document.createElement("span");
	const split = document.createElement("span");

	user.classList.add("green");
	user.textContent = `${system.username} `;

	path.classList.add("blue");
	path.textContent = system.currentPath;

	split.classList.add("green");
	split.textContent = " $ ";

	return [user, path, split];
}

function println(str, ...prefix) {
	const p = document.createElement("p");

	if (prefix.length) {
		p.append(...prefix);
	}

	str.split("\n").forEach((line) => {
		const text = document.createElement("span");
		text.classList.add("white");
		text.innerText = line;
		p.append(text, document.createElement("br"));
	});

	app.appendChild(p);
}

function appendInpput() {
	const line = document.createElement("p");
	const input = document.createElement("input");

	input.classList.add("input", "white");
	const [user, path, split] = prefix();

	const restoreHistory = () => {
		if (system.history.pos < 0) {
			system.history.pos = 0;
		}
		if (system.history.pos > system.history.commands.length) {
			system.history.pos = system.history.commands.length - 1;
		}
		const command = system.history.commands[system.history.pos];
		input.value = command ? command : "";
		execute(() => {
			input.focus();
			input.setSelectionRange(input.value.length, input.value.length);
		});
	};

	input.addEventListener("keydown", (e) => {
		switch (e.key) {
			case "ArrowUp":
				system.history.pos--;
				restoreHistory();
				break;
			case "ArrowDown":
				system.history.pos++;
				restoreHistory();
				break;
			case "Tab":
				e.preventDefault();
				println(input.value, ...prefix());
				const complemented = handleComplete(input.value);
				if (complemented) {
					input.value = complemented;
				}
				break;
		}

		if (e.key !== "Enter") {
			return;
		}

		println(input.value, ...prefix());
		handleCommand(input.value);

		path.textContent = system.currentPath;
		user.textContent = `${system.username} `;

		system.history.commands.push(input.value.trim());
		system.history.pos = system.history.commands.length - 1;
		input.value = "";
	});

	const focus = (target) => {
		execute(() => {
			target.focus();
		});
	};

	window.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			focus(input);
		}
	});

	focus(input);

	line.append(user, path, split, input);
	document.querySelector("#input").appendChild(line);
}

function handleCommand(text) {
	if (!text) {
		return;
	}

	const split = text.split(" ");
	const label = split[0];
	const args = split.slice(1, split.length);

	const executor = commands[label];

	if (executor !== undefined) {
		executor(args);
	} else {
		println(`command not found: ${label}`);
	}
}

function handleComplete(text) {
	if (!text) {
		return;
	}

	const split = text.split(" ");
	const label = split[0];
	const args = split.slice(1);

	const completer = completers[label];

	if (completer) {
		const completeArgs = completer(args);
		if (completeArgs) {
			return `${label} ${completeArgs.join(" ")}`;
		}
	}
}

function initializeFileTree() {
	system.direcotries.push("/about/");
	system.direcotries.push("/products/");
	system.direcotries.push("/links/");
	system.files["/about/about.txt"] = `onimenです。2002年11月26日生まれです。
	主にJavaとJavascriptで開発をしています。
	他にも、Python, Go言語などもに時々使います。
	このポートフォリオは一枚のjsファイルに書いていますが、
	Node.js、Vue.jsでSPAを作ったりもします。`;
	system.files["/products/TheLowHP.link"] = "https://portal.eximradar.jp/thelow";
	system.files["/products/HMage-Mod.link"] = "https://hmage123456.github.io/hmgemod/";
	system.files["/links/twitter.link"] = "https://twitter.com/onim_en";
	system.files["/links/github.link"] = "https://github.com/Oni-Men";
}

function execute(executor) {
	window.setTimeout(executor, 1);
}

window.addEventListener("load", () => {
	initializeFileTree();
	appendInpput();
	println("Welcome to my portfolio page!\nCopy right 2021 Onimen All right reserved.");
});
