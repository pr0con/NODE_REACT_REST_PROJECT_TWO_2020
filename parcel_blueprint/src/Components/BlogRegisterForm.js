import React, { useState, useRef } from 'react'
import styled from 'styled-components';
import axios from 'axios';


const StyledBlogRegisterForm = styled.div`
	padding: 1rem;
	border: 1px solid rgba(9,81,105);
`


export function BlogRegisterForm({ setRegisterInput, formData, setMessages, user, loading, setJwt, setUser  }) {
	const formEl = useRef(null);

	const PasswordsMatch = () => {
		if(formData['password'] === formData['password2']) {
			delete formData['password2'];
			return true;
		}else {
			setMessages((pm) => ([ ...pm, { code: '600', msgs: [ 'Passwords do not match.' ]} ]));
			return false;
		}
	}

	const handleSubmit = (e) => {
		e.preventDefault();
		
		if(PasswordsMatch()) {
			let options = {
				headers: {
				    'Content-Type': 'application/json'
				},			
			}
			axios.post('https://junk.pr0con.io:8000/api/auth/register', formData, options).then((res) => {	
				if('Code' in res.data && 'Success' in res.data) {
					setJwt(res.data.jwt);
					setUser(res.data.user);
					
					window.localStorage.setItem('BlogsJwt', res.data.jwt);
					setMessages((pm) => ([ ...pm, { code: res.data.Code, msgs: [ ...res.data.Success ]} ]));						
				}
			}, (error) => {
				console.log(error.response);
				if('Code' in error.response.data && 'Error' in error.response.data) {
					setMessages((pm) => ([ ...pm, { code: error.response.data.Code, msgs: [ ...error.response.data.Error ]} ]));
				}
			});		
		}	
	}
	
	
	return(
		<StyledBlogRegisterForm>
			<div className="form-title">Register</div>
			<form ref={formEl} onSubmit={(e) => handleSubmit(e)} autoComplete="off">
				<fieldset disabled={ (loading === true || (loading === false && user !== null)) ? 'disabled': ''}>
					<input type="text" name="name" onChange={setRegisterInput} placeholder="name"/>
					<input type="text"  name="alias" onChange={setRegisterInput} placeholder="alias"/>
					<input type="email"  name="email" onChange={setRegisterInput} placeholder="email"/>
					<input type="password"  name="password" onChange={setRegisterInput} placeholder="password"/>
					<input type="password"  name="password2" onChange={setRegisterInput} placeholder="retype password"/>
					<div className="form-actions">
						<div className="flex-row-filler"></div>
						<input type="submit" value="Submit" />	
					</div>					
				</fieldset>
			</form>
		</StyledBlogRegisterForm>
	)
}			
	