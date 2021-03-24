export class Path {
	constructor(parent, name, isDirectory) {
		this.parent = parent;
		this.name = name;
		this.isDirectory = isDirectory;
	}

	toString() {
		if (this.parent == null) {
			return `/${this.name}`;
		}
		return `${this.parent.toString()}/${this.name}`;
	}
}
