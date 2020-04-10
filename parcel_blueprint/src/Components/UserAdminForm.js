import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components';
import axios from 'axios';
import uniqid from 'uniqid';

const StyledUserAdminForm = styled.div`
	padding: 1rem;
	border: 1px solid rgba(9,81,105);
`;


export function UserAdminForm({ jwt, setMessages, doLogOut, users, setUsers, selectedUser, setSelectedUser, selectedUserRole, setSelectedUserRole }) {
	const formEl = useRef(null);

	/* Collect users first */
	useEffect(() => {	
		let options = {
			headers: {
			    'Authorization': 'Bearer ' + jwt
			},			
		}
		axios.get('https://junk.pr0con.io:8000/api/system/get/users', options).then((res) => {
			
			console.log(res);
			if('Code' in res.data && 'Success' in res.data) {
				setMessages((pm) => ([ ...pm, { code: res.data.Code, msgs: [ ...res.data.Success ]} ]));
				setUsers(res.data.users)
			}			
		}, (error) => {
			if(typeof(error.response.data) == 'object' && 'response' in error && 'data' in error.response && !(typeof(error.response) == 'undefined') && typeof(error.response) === 'object') {
				//console.log(error);
				//console.log(typeof(error.response));
				//console.log(typeof(error.response.data));
				if('Code' in error.response.data && 'Error' in error.response.data) {
					setMessages((pm) => ([ ...pm, { code: error.response.data.Code, msgs: [ ...error.response.data.Error ]} ]));
					(parseInt(error.response.data.Code) === 601) ? doLogOut() : '';
				}
				
			}
		});						
	},[]);
	
	const handleSelectUser = (e) => {
		//console.log(e.target)
		//console.log(e.target.options[event.target.selectedIndex].dataset.role);		
		setSelectedUser(e.target.value);
		setSelectedUserRole(e.target.options[event.target.selectedIndex].dataset.role);	
	}
	
	const handleSubmit = (e) => {
		e.preventDefault();
		let options = {
			headers: {
			    'Authorization': 'Bearer ' + jwt
			},			
		}
		axios.post('https://junk.pr0con.io:8000/api/system/update/user', { uoid: selectedUser, role: selectedUserRole } ,options).then((res) => {	
			console.log(res);
			if('Code' in res.data && 'Success' in res.data) {
				setMessages((pm) => ([ ...pm, { code: res.data.Code, msgs: [ ...res.data.Success ]} ]));
				setUsers(res.data.users);
			}			
		}, (error) => {
			//will fail if these dont exist add extra checks.. here..
			if(typeof(error.response.data) == 'object') {
				if('Code' in error.response.data && 'Error' in error.response.data) {
					setMessages((pm) => ([ ...pm, { code: error.response.data.Code, msgs: [ ...error.response.data.Error ]} ]));
					(parseInt(error.response.data.Code) === 601) ? doLogOut() : '';
				}
			}			
		});		
	}
		

	return(
		<StyledUserAdminForm>
			<div className="form-title">User Admin</div>
			<form ref={formEl} onSubmit={(e) => handleSubmit(e)}>
				<select className="form-select" onChange={(e) => handleSelectUser(e)} value={selectedUser}>
					{ (users !== null && users.length > 0) && users.map((usr,i) => (
						<option value={usr._id} data-role={usr.role} key={uniqid()}>{ usr.name }</option>
					))}
				</select>
				<input type="text" name="role" onChange={(e) => setSelectedUserRole(e.target.value)}  value={selectedUserRole}/>
				<div className="form-actions">
					<div className="flex-row-filler"></div>
					<input type="submit" value="Submit" />	
				</div>								
			</form>
		</StyledUserAdminForm>		
	)			
}




