import React from 'react';
import App, { Container } from 'next/app';
import Layout from 'core/layout';
import { Provider } from 'unistore/react';
import store from 'core/store';

class CustomApp extends App {
	static async getInitialProps({ Component, ctx }) {
		let pageProps = {};

		if (Component.getInitialProps) {
			pageProps = await Component.getInitialProps(ctx);
		}

		return { pageProps };
	}

	render() {
		const { Component, pageProps } = this.props;

		return (
			<Provider store={ store }>
				<Container>
					<Layout>
						<Component { ...pageProps } />
					</Layout>
				</Container>
			</Provider>
		);
	}
}

export default CustomApp;
