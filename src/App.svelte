<script>
	import Line from "./line.svelte";

	export let system = null;
	export let commands = {};

	let history_index = 0;
	let history = [];

	let lines = [];
	let input = "";

	let inputElement = null;

	function println(data) {
		if (data === "\u007F") {
			lines = [];
		} else if (typeof data === "stirng") {
			lines = [...lines, data];
		} else {
			lines = [...lines, data];
		}
	}

	function handleInput(event) {
		switch (event.key) {
			case "Enter":
				println({
					username: system.username,
					path: system.path,
					text: input,
				});
				handleCommand(input);
				input = "";
				break;
			case "Tab":
				event.preventDefault();
				if (input) {
					const args = input.split(" ");
					const text = args[args.length - 1];
				}
				break;
			case "ArrowUp":
			case "ArrowDown":
				if (event.key === "ArrowUp") {
					if (history_index == history.length) {
						history.push(input);
					}
					history_index--;
				} else {
					history_index++;
				}

				if (history_index < 0) {
					history_index = 0;
				}

				if (history_index >= history.length) {
					history_index = history.length - 1;
				}

				console.log(history);

				input = history[history_index];

				setTimeout(() => {
					inputElement.focus();
					inputElement.selectionStart = input.length;
				}, 1);
				break;
		}

		if (event.key === "Enter") {
		} else if (event.key === "Tab") {
			event.preventDefault();
			if (input) {
				const args = input.split(" ");
				const text = args[args.length - 1];
			}
		}
	}

	function handleCommand(text) {
		if (!text) {
			return;
		}

		history.push(text);
		history_index = history.length;

		const split = text.split(" ");
		const label = split[0];
		const args = split.slice(1);

		const executor = commands[label];

		if (executor !== undefined) {
			executor.execute(println, system, args);
		} else {
			println(`command not found: ${label}`);
		}

		system = system;
	}

	function sendWelcomMessage() {
		println("WELCOME TO Onimen's PORTFOLIO");
		println('Type "help" to list all command');
		println("(C) 2021 Onimen ALL RIGHT RESERVED.");
	}

	document.body.addEventListener("click", (event) => {
		if (event.target === document.body) {
			document.querySelector("#input").focus();
		}
	});
</script>

<main on:load={sendWelcomMessage()}>
	{#each lines as line}
		{#if typeof line === "string"}
			<p>{@html line}</p>
		{:else}
			<Line {...line} />
		{/if}
	{/each}
	<div class="flex">
		<div class="prefix">
			<span class="chameleon-m">{system.username}</span><span class="blue-m">{system.path}</span><span class="plum-l"
				>$
			</span>
		</div>
		<input bind:this={inputElement} id="input" bind:value={input} on:keydown={handleInput} />
	</div>
</main>

<style>
	main {
		padding: 1em;
		margin: 0 auto;
		max-width: 240px;
	}

	span {
		margin-right: 0.8em;
	}

	.flex {
		display: flex;
	}

	#input {
		display: inline;
		color: inherit;
		background: transparent;
		border: none;
		outline: none;
		padding: 0;
		font-size: 1em;
		font-family: inherit;
		flex-grow: 1;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
