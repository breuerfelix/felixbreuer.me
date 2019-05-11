import createStore from 'unistore';
import { connect as org_connect } from 'unistore/react';

import { Observable } from 'rxjs';
import {
	pluck as rx_pluck,
	distinctUntilChanged,
	publishReplay
} from 'rxjs/operators';

const initialState = {
	// auth
	jwt: null,

	// user
	name: null,
	nickname: null,
	email: null,
	roles: []
};

const store = createStore(initialState);

// common default actions
const actions = store => ({
	// example action
	setActions: (state, actions) => ({ actions }),
});

// decorator which injects all actions
const connect = values => org_connect(values, actions);

// rxjs observable for the store
const store$ = Observable.create(
	observer => store.subscribe(state => observer.next(state))
).pipe(publishReplay(1));

// initialisation
store$.connect(); // start the observable
store.setState({ ...initialState }); // emit the initial state

// extension methods for easier use
function sub(keys, func) {
	return this.pluck(keys).subscribe(func);
}

function pluck(keys) {
	return store$.pipe(
		rx_pluck(...keys.split('.')),
		distinctUntilChanged()
	);
}

store.sub = sub;
store.pluck = pluck;

export {
	store$,
	store,
	actions,
	connect
};

export default store;
