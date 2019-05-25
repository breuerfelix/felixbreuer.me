<style>
	.logo {
		background-color: var(--dark);
		color: white;
		padding: 7px 30px;
		margin-top: 50px;
		margin-bottom: 20px;
		font-size: 125%;
	}

	.subtitle {
		color: var(--gray);
		margin-bottom: 30px;
		font-size: 85%;
	}

	.navbar {
		margin-bottom: 10px;
	}

		.item {
		margin: 0 10px;
		border-style: solid;
		border-width: 0 0 1px 0;
		border-color: white;
		padding-bottom: 3px;
	}
	
	.item:hover {
		border-color: var(--dark);
	}

	.item:hover > a, .item.selected > a {
		color: var(--highlight);
	}
</style>

<script>
	import config from 'core/config';
	export let segment;

	const navItems = [
		{ label: 'about', link: '/' },
		{ label: 'projects', link: '/projects' },
		{ label: 'guides', link: '/guides' },
		{ label: 'github', link: config.githubLink }
	];
</script>

<nav>
	<div class='center'>
		<div class='logo center'>
			{ config.title }
		</div>
	</div>
	<div class='center'>
		<div class='subtitle'>
			{ config.subTitle }
		</div>
	</div>
	<div class='center'>
		<div class='navbar center'>
			{#each navItems as item}
			<div class='item' class:selected={(segment || 'about') === item.label}>
				<a
					rel=prefetch
					href={ item.link }
					class='label'
				>{ item.label }</a>
			</div>
			{/each}
		</div>
	</div>
</nav>