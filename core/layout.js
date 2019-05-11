import Head from 'next/head';
import NavBar from 'components/navbar';
import config from 'core/config';
import mainCSS from 'styles/main.css';

const Layout = props => (
	<>
		<Head>
			<title>{ config.title }</title>
			<meta charSet='utf-8' />
			<meta
				key='viewport'
				name='viewport'
				content='width=device-width, initial-scale=1, shrink-to-fit=no'
			/>
			<link
				key='flexboxgrid-css'
				rel='stylesheet'
				href='/static/flexboxgrid.min.css'
			/>
			<link
				rel='stylesheet'
				href='https://fonts.googleapis.com/css?family=Lato'
			/>
		</Head>
		<style jsx>{ mainCSS }</style>
		<NavBar />
		<div>
			{props.children}
		</div>
	</>
);

export default Layout;

// use as a function - don't change this
const withLayout = Page => {
	return () => (
		<Layout>
			<Page />
		</Layout>
	);
};

export {
	withLayout
};
