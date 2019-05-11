const path = require('path');

const config = {
	target: 'serverless',

	webpack(config, { defaultLoaders }) {
		// absolute module resolution
		config.resolve.modules.push(path.resolve('./'));

		// import css files
		config.module.rules.push({
			test: /\.css$/,
			use: [
				defaultLoaders.babel,
				{
					loader: require('styled-jsx/webpack').loader,
					options: {
						type: 'scoped'
					}
				}
			]
		});

		return config;
	}
};

module.exports = config;
