<script context='module'>
	export function preload({ params, query }) {
		return this.fetch('guides.json').then(r => r.json()).then(guides => ({ guides }));
	}
</script>

<script>
	export let guides;
</script>

<style>
	.title {
		margin: 30px 0;
		font-weight: bold;
		font-size: 110%;
		padding: 0 20px;
	}

	.items {
		border-style: solid;
		border-width: 0 0 0 3px;
		border-color: #f5f5f5f5;
		margin: 0 10px;
	}

	.item {
		padding: 25px 20px;
		border-style: dashed;
		border-width: 0 0 1px 0;
		border-color: var(--border);
	}
	
	.item:hover {
		border-color: var(--border-hover);
	}
</style>

<div class='list'>
	<div class='title'>The Guides</div>
	<div class='items'>
		{#each guides as guide}
		<div class='item'>
			<a href='guides/{ guide.slug }'>{ guide.title }</a>
		</div>
		{/each}
	</div>
</div>