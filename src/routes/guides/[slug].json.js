import guides from 'core/guides';

export function get(req, res, next) {
	const { slug } = req.params;

	const guide = guides.get(slug);
	if (!guide) {
		res.writeHead(404, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({
			message: `Not found`
		}));

		return;
	}

	res.writeHead(200, {
		'Content-Type': 'application/json'
	});

	res.end(JSON.stringify(guide));
}
