import fetch from 'isomorphic-unfetch';

const headers = {};

async function fetchGet(url) {
	const res = await fetch(url, { headers });
	const json = await res.json();
	return json;
}

async function fetchPost(url, data) {
	const res = await fetch(url, {
		method: 'POST', // GET, POST, PUT, DELETE, etc.
		headers: {
			'Content-Type': 'application/json',
			... headers
			// "Content-Type": "application/x-www-form-urlencoded",
		},
		body: JSON.stringify(data),
	});

	const json = await res.json();
	return json;
}

const sleep = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
};

export {
	fetchPost,
	fetchGet,
	sleep
};
