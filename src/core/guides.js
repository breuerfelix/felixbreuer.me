import md from 'core/markdown';

class guides {
    constructor() {
        this.guides = md.readFiles('./src/content/guides/');
    }

    toJSON() {
        return JSON.stringify(this.guides);
    }

    get(slug) {
        return this.guides.find(guide => guide.slug == slug);
    }
}

export default new guides();