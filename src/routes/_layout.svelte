<script>
	import NavBar from 'components/nav';
	import config from 'core/config';

	export let segment;
</script>

<svelte:head>
	<title>{ config.title }</title>
</svelte:head>

<NavBar {segment}/>
<slot></slot>