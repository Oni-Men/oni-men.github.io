<script>
	import Line from "./line.svelte";

	export let system = null;
	export let commands = {};

	let lines = [];
	let input = "";

	function println(data) {
		if (data === "\u007F") {
			lines = [];
		} else if (typeof data === "stirng") {
			lines = [...lines, data];
		} else {
			lines = [...lines, data];
		}
	}

	function handleEnter(event) {
		if (event.key === "Enter") {
			println({
				username: system.username,
				path: system.path,
				text: input,
			});
			handleCommand(input);
			input = "";
		}
	}

	function handleCommand(text) {
		if (!text) {
			return;
		}

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

	document.body.addEventListener("click", (event) => {
		if (event.target === document.body) {
			document.querySelector("#input").focus();
		}
	});
</script>

<main on:load={println("(C) 2021 Onimen ALL RIGHT RESERVED.")}>
	{#each lines as line}
		{#if typeof line === "string"}
			<p>{@html line}</p>
		{:else}
			<Line {...line} />
		{/if}
	{/each}
	<p>
		<span class="chameleon-m">{system.username} </span>
		<span class="blue-m">{system.path} </span>
		<span class="plum-l">$ </span>
		<input id="input" bind:value={input} on:keydown={handleEnter} />
	</p>
</main>

<style>
	main {
		padding: 1em;
		margin: 0 auto;
		max-width: 240px;
	}

	input {
		color: inherit;
		background: transparent;
		border: none;
		outline: none;
		padding: 0;
		font-size: 1em;
		font-family: inherit;
		width: 50%;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
