import React, { useState } from 'react';
import styled from 'styled-components';
import { navigate } from 'hookrouter'; //export this for use everywhere


const StyledSidebar = styled.div`
	width: 32rem;
	height: calc(100vh - 5rem);
	border-right: 1px solid rgba(9, 81, 105, 1);
	
	display: flex;
	flex-direction: column;
	padding: 1rem;
	font-size: 2rem;
	
	.nav-item {
		display: flex;
		flex-diection: row;
		
		.nav-item-indicator {
			height: 2.5rem;
			widht: 2px;
			margin-right: 2rem;
			
			&.${(props) => props.selected} {
				border-left: 2px solid rgba(83,186,131,1);
			}	
		}
		
		&:hover {
			cursor:pointer;
		}
		
		&:not(:first-child) {
			margin-top: .5rem;
		}
	}
	
`;



export function Sidebar() {
	const [ selected, setSelected ] = useState('dashboard');
	
	return(
		<StyledSidebar selected={selected}>
			<div className="nav-item" onClick={(e) => {navigate('/'); setSelected('dashboard'); }}><span className="nav-item-indicator dashboard"></span><span>Dashboard</span></div>
			<div className="nav-item" onClick={(e) => {navigate('/blogs'); setSelected('blogs'); }}><span className="nav-item-indicator blogs"></span><span>Blog Rest API</span></div>				
		</StyledSidebar>
	)	
}