import { Component } from 'react';
import content from 'services/content';
import List from 'components/list';

class Guides extends Component {
	static async getInitialProps() {
		return { guides: await content.getGuides() };
	}

	render() {
		console.log('props!:', this.props.guides);
		return (
			<div>
				<List
					title='JavaScript'
					items={ this.props.guides }
				/>
			</div>
		);
	}
}

export default Guides;
