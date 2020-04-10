import React, { useState, useRef } from 'react'
import styled from 'styled-components';
import axios from 'axios';

const StyledBlogLoginForm = styled.div`
	padding: 1rem;
	border: 1px solid rgba(9,81,105);
`;

export function BlogLoginForm({ user, loading, setLoading, setLoginInput, formData, setMessages, setUser, setJwt }) {
	const formEl = useRef(null);
	
	//Could set loading to true here...
	const handleSubmit = (e) => {
		e.preventDefault();

		formData['user'] = btoa(formData['user']);
		formData['password'] = btoa(formData['password']);

		console.log(formData);

		let options = {
			headers: {
			    'Content-Type': 'application/json'
			},			
		}
		axios.post('https://junk.pr0con.io:8000/api/auth/login', formData, options).then((res) => {		
			console.log(res);
			if('Code' in res.data && 'Success' in res.data) {
				setJwt(res.data.jwt);
				setUser(res.data.user);
				
				window.localStorage.setItem('BlogsJwt', res.data.jwt);
				setMessages((pm) => ([ ...pm, { code: res.data.Code, msgs: [ ...res.data.Success ]} ]));
			}
		}, (error) => {
			
			if(!(typeof(error.response) == 'undefined') && typeof(error) === 'object') {
				setMessages((pm) => ([ ...pm, { code: error.response.data.Code, msgs: [ ...error.response.data.Error ]} ]));
			}
		});
		
		formEl.current.reset();
		setLoginInput(null, true);
	}
	
		
	return(
		<StyledBlogLoginForm>	
			<div className="form-title">Login</div>
			<form ref={formEl} onSubmit={(e) => handleSubmit(e)} autoComplete="off">
				<fieldset disabled={ (loading === true || (loading === false && user !== null)) ? 'disabled': ''}>
					<input type="text" name="user" onChange={setLoginInput} placeholder="username (alias || email)"/>
					<input type="password"  name="password" onChange={setLoginInput} placeholder="password"/>
					<div className="form-actions">
						<div className="flex-row-filler"></div>
						<input type="submit" value="Login" />	
					</div>		
				</fieldset>
			</form>
		</StyledBlogLoginForm>
	)
}		