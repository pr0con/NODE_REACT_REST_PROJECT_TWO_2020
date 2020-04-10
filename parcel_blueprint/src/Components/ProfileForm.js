import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components';
import axios from 'axios';


const StyledProfileForm = styled.div`
	padding: 1rem;
	border: 1px solid rgba(9,81,105);
	
	.profile-image {
		position: relative;
		width: 10rem;
		height: 10rem;
		border-radius: 50%;
		left: 50%;
		transform: translateX(-50%);		
	}
		
	
	.svg-profile-image-placeholder  {
		position: relative;
		width: 10rem;
		height: 10rem;
		left: 50%;
		transform: translateX(-50%);
	}	
`;

import { FilePond_ } from './FilePond_.js';

export function ProfileForm({ jwt, user, setUsers, setMessages, updateUserInput, setUpdateUserInput, profile, setProfile }) {
	const formEl = useRef(null);
	
	useEffect(() => {
		setProfile((p) => ({ name: user['name'], alias: user['alias'], email: user['email'] }));
	},[]);	
	
	
	/* 
		could create a fake e.currentTarget for useInputHook thing  and update 
		-will test this theory later...
	*/	
	const updateProfile = (e) => {		
		e.persist();
		setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
	}
	
	const handleSubmit = (e) => {
		e.preventDefault()
		let options = {
			headers: {
				'uoid': user['_id'],
			    'Content-Type': 'application/json',
			    'Authorization': 'Bearer ' + jwt
			},	
		}
		axios.post('https://junk.pr0con.io:8000/api/profile/update', profile, options).then((res) => {		
			if('Code' in res.data && 'Success' in res.data) {			
				setMessages((pm) => ([ ...pm, { code: res.data.Code, msgs: [ ...res.data.Success ]} ]));
				setUsers(res.data.users) //this just gets an empty array.... fix me up...
			}	
		}, (error) => {
			//console.log(error.response);
			if('Code' in error.response.data && 'Error' in error.response.data) {
				setMessages((pm) => ([ ...pm, { code: error.response.data.Code, msgs: [ ...error.response.data.Error ]} ]));
			}
		});					
	}
	
	const [ frr, setFrr ] = useState(0); //force re-render....
	return(
		<StyledProfileForm>	
			{ ('profile_image_path' in user) && <img className="profile-image" src={`${user.profile_image_path}?v=${frr}`} />}
			{ (!('profile_image_path' in user)) && <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="user-circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" className="svg-profile-image-placeholder svg-inline--fa fa-user-circle fa-w-16 fa-7x"><path fill="currentColor" d="M248 104c-53 0-96 43-96 96s43 96 96 96 96-43 96-96-43-96-96-96zm0 144c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm0-240C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-49.7 0-95.1-18.3-130.1-48.4 14.9-23 40.4-38.6 69.6-39.5 20.8 6.4 40.6 9.6 60.5 9.6s39.7-3.1 60.5-9.6c29.2 1 54.7 16.5 69.6 39.5-35 30.1-80.4 48.4-130.1 48.4zm162.7-84.1c-24.4-31.4-62.1-51.9-105.1-51.9-10.2 0-26 9.6-57.6 9.6-31.5 0-47.4-9.6-57.6-9.6-42.9 0-80.6 20.5-105.1 51.9C61.9 339.2 48 299.2 48 256c0-110.3 89.7-200 200-200s200 89.7 200 200c0 43.2-13.9 83.2-37.3 115.9z" ></path></svg> }				
			
			<FilePond_ jwt={jwt} url="https://junk.pr0con.io:8000/api/profile/image" id="filepond-profile-image" label="Change Profile Image" setMessages={setMessages} setFrr={setFrr} hkv={{key: 'uoid', value: user['_id']}} />	
			
			<form ref={formEl} onSubmit={(e) => handleSubmit(e)} autoComplete="off">
				<input type="text" name="name" onChange={(e) => { setUpdateUserInput(e); updateProfile(e); }} placeholder="name" value={profile.name}/>
				<input type="text"  name="alias" onChange={(e) => { setUpdateUserInput(e); updateProfile(e); }} placeholder="alias" value={profile.alias}/>
				<input type="email"  name="email" onChange={(e) => { setUpdateUserInput(e); updateProfile(e); }} placeholder="email" value={profile.email}/>				
				<div className="form-actions">
					<div className="flex-row-filler"></div>
					<input type="submit" value="Submit" />	
				</div>				
			</form>
		</StyledProfileForm>
	)
}