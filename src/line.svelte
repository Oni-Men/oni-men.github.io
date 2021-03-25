<script>
	export let username = "";
	export let path = "";
	export let text = "";
</script>

<p>
	<span class="chameleon-m">{username}</span><span class="blue-m">{path}</span><span class="plum-l">$</span><span
		>{@html text}</span
	>
</p>

<style>
	p {
		margin: 0;
	}
	span {
		margin-right: 0.8em;
	}
</style>
