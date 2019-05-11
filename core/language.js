class Language {
	_table = null;

	constructor() {
		this._table = this.getTable('en');
	}

	translate = token => {
		const rv = this._table[token];
		if (rv) return rv;
		return token;
	}

	getTable = language => {
		try {
			// TODO make GET request to get new language table
			throw 'no valid response';
		} catch (err) {
			return this.defaultTable;
		}
	}

	defaultTable = {
		// translation keys here
		NAVBAR_HOME: 'Home',
		NAVBAR_LOGIN: 'Login / Sign up',
		NAVBAR_LOGOUT: 'Logout'
	};
}

const language = new Language();
const translate = language.translate;

export {
	translate
};
