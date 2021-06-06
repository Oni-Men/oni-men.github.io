export class System {
	username = "guest@ONIX-PC";
	path = "/";
	commands = {};
	direcotries = ["/"];
	files = {};

	constructor() {
		this.initializeFileTree();
	}

	get allFiles() {
		return this.direcotries.concat(Object.keys(this.files));
	}

	resolvePath(path) {
		//開始文字列が「./」、「/」、「../」のいずれでもない場合、「./」を付与する
		if (!/^(\/|\.{1,2}\/).*$/.test(path)) {
			path = `./${path}`;
		}

		const names = path.split("/");
		const currents = this.path === "/" ? [""] : this.path.split("/");

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

	initializeFileTree() {
		this.direcotries.push("/about/");
		this.direcotries.push("/products/");
		this.direcotries.push("/links/");
		this.files["/about/about.txt"] = `onimen(山本遼太郎)といいます。2002年11月26日生まれです。
		主にJavaとJavascriptで開発をしています。
		他にも、Python, Go言語などもに時々使います。
		JavaではEclipse、JavascriptではVSCodeを利用しています。
		このポートフォリオはsvelteというフレームワークを使用していますが、
		Vue.jsでSPAを作ったりもします。
		これまでに製作した作品は /products からご覧ください。`;
		this.files["/products/TheLowHP.txt"] = `TheLowはマインクラフトのサーバー上で遊べるRPGです。
		こちらの公式サイトを制作しました。他のスタッフと話し合いながらロゴも制作しました。`;
		this.files["/products/HMage-Mod.txt"] = `マインクラフトの海外サーバー(us.shotbow.net)で
		より楽しく遊ぶためのマインクラフトMODです。自分ともう一人の開発者で共同開発しました。`;
		this.files["/products/TheLowHP.link"] = "https://portal.eximradar.jp/thelow";
		this.files["/products/HMage-Mod.link"] = "https://hmage123456.github.io/hmgemod/";
		this.files["/links/github.link"] = "https://github.com/Oni-Men";
	}
}
