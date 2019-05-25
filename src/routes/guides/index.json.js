import guides from 'core/guides';

export function get(req, res) {
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});

	res.end(guides.toJSON());
}