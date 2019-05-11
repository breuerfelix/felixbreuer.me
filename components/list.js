import { Component } from 'react';
import Link from 'next/link';

class List extends Component {
	render() {
		const { title, items } = this.props;
		const itemsHTML = items.map(
			item => <ListItem key={ item.url } item={ item } />
		);

		// TODO prefetch post on hover
		return (
			<>
				<style jsx>{`
				.list-items {
					border-style: solid;
					border-width: 0 0 0 3px;
					border-color: #f5f5f5f5;
					margin: 0 10px;
				}
				.list-title {
					margin: 30px 0;
					font-weight: bold;
					font-size: 110%;
					padding: 0 20px;
				}
				`}</style>
				<div className='list'>
					<div className='list-title'>{ title }</div>
					<div className='list-items'>{ itemsHTML }</div>
				</div>
			</>
		);
	}
}

export default List;

const ListItem = ({ item }) => (
	<>
		<style jsx>{`
			.item {
				padding: 25px 20px;
				border-style: dashed;
				border-width: 0 0 1px 0;
				border-color: var(--border);
			}
			.item:hover {
				border-color: var(--border-hover);
			}
		`}</style>
		<div key={ item.url } className='item'>
			<Link href={ item.url }>
				{ item.title }
			</Link>
		</div>
	</>
);
