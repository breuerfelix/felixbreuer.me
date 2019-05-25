import markdownit from 'markdown-it';
import fm from 'front-matter';
import path from 'path';
import fs from 'fs';
import slugify from 'slugify';

class markdown {
    constructor() {
        this.mdit = new markdownit();
    }

    readFiles(dir) {
        const folder = path.resolve(dir);

        const output = fs.readdirSync(folder).map(filename => {
            const content = fs.readFileSync(path.join(folder, filename), 'utf-8');
            return {
                filename,
                content
            };
        }).map(guide => {
            const parsedFront = fm(guide.content);
            return {
                filename: guide.filename,
                content: this.mdit.render(parsedFront.body),
                ...parsedFront.attributes
            };
        }).map(guide => {
            return {
                ...guide,
                tags: guide.tags ? guide.tags.split(' ') : [],
                slug: guide.slug || slugify(guide.title)
            };
        }).reverse();

        return output;
    }
}

export default new markdown();