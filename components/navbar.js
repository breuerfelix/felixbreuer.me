import { Component } from 'react';
import config from 'core/config';
import Link from 'next/link';
import { translate } from 'core/language';

import navbarCSS from 'styles/navbar.css';

class NavBar extends Component {
	// TODO prefetch link on hover
	render() {
		return (
			<>
				<style jsx>{ navbarCSS }</style>
				<div className='row center-xs'>
					<div className='col-xs-12 center'>
						<div className='logo center'>
							{ config.title }
						</div>
					</div>
					<div className='col-xs-12 center'>
						<div className='subtitle'>
							{ config.subTitle }
						</div>
					</div>
					<div className='col-xs-12 center'>
						<div className='navbar center'>
							<NavbarItem
								label='about'
								link='/'
							/>
							<NavbarItem
								label='projects'
								link='/projects'
							/>
							<NavbarItem
								label='guides'
								link='/guides'
							/>
							<NavbarItem
								label='github'
								link={ config.githubLink }
								external={ true }
							/>
						</div>
					</div>
				</div>
			</>
		);
	}
}

export default NavBar;

const NavbarItem = ({ label, link, external = false }) => (
	<div className='item'>
		<style jsx>{`
			.item {
				margin: 0 10px;
				border-style: solid;
				border-width: 0 0 1px 0;
				border-color: white;
				padding-bottom: 3px;
			}
			
			.item:hover {
				border-color: var(--dark);
			}
		`}</style>
		{ !external &&
			<Link href={ link }>
				<a className='label'>{ translate(label) }</a>
			</Link>
		}
		{ external &&
			<a
				href= { link }
				className='label'
				target='__blank'
			>{ translate(label) }</a>
		}
	</div>
);
