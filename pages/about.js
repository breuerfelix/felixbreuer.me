import Link from 'next/link';

const About = () => (
	<div>
		<div>About page</div>
		<Link href='/'>
			<a>home</a>
		</Link>
		<p>
			hallo test man
		</p>
	</div>
);

export default About;
