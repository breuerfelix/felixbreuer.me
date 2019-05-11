import config from 'core/config';
import { fetchGet } from 'core/utils';

class content {
	constructor() {
		this.githubAPI = 'https://api.github.com/repos/' + config.contentRepoName;
		this.contentsLink = this.githubAPI + '/contents';
	}

	async getGuides() {
		const response = await fetchGet(this.contentsLink + config.contentGuidesFolder);
		return response.filter(post => post.type == 'file').map(post => {
			return {
				date: Date.now(),
				topic: 'general',
				title: post.name,
				url: post.download_url
			};
		});
	}
}

export default new content();