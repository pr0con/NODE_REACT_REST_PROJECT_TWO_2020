import React, { useState, useEffect } from 'react'
import axios from 'axios';
import styled from 'styled-components';
import ReactJson from 'react-json-view';
import uniqid from 'uniqid';

const StyledBlogs = styled.div`
	border: 1rem solid rgba(1,1,1,1);
	max-height: calc(100vh - 11rem);
	overflow: scroll;

	
	.board-debugger {
		.debugger.active {
			width: 100%;
			height: auto;
			display: block;		
		}
	}	
`;

import { useInputChange } from './useInputChange.js';
import { BlogLoginForm } from './BlogLoginForm.js';
import { BlogRegisterForm } from './BlogRegisterForm.js';
import { UserAdminForm } from './UserAdminForm.js';
import { ProfileForm } from './ProfileForm.js';
import { CategoriesForm } from './CategoriesForm.js';
import { TagsForm } from './TagsForm.js';

export function Blogs() {
	const [ jwt, setJwt ] = useState(null);
	const [ user, setUser ] = useState(null);
	const [ loading, setLoading ] = useState(true);
	
	const [ loginInput, setLoginInput] = useInputChange();
	const [ registerInput, setRegisterInput] = useInputChange();
	const [ updateUserInput, setUpdateUserInput] = useInputChange();
	
	const [ messages, setMessages ] = useState([]);
	
	/* System Admin stuff */
	const [ users, setUsers ] = useState(null);
	const [ selectedUser, setSelectedUser ] = useState(null);
	const [ selectedUserRole, setSelectedUserRole ] = useState('');

	
	/* Profile Data */
	const [ profile, setProfile ] = useState({
		name: '',
		alias: '',
		email: '',
	});	
	
	/* System Categories */	
	const [ categories, setCategories ] = useState([]);
	const [ selectedCategory, setSelectedCategory ] = useState('');	
			
	const [ debug, setDebug ] = useState({
		'application-debugger': 'active',
	});
	
	const doLogOut = () => {
		setUser(null);
		setJwt(null);
		window.localStorage.removeItem('BlogsJwt');
		setMessages((pm) => ([ ...pm, { code: '700', msgs: [ 'User Logged Out', 'User Data Cleared' ]} ]));
	}
	
	//Check we have a LocalStorage Jwt
	useEffect(() => {	
		let ls_jwt = window.localStorage.getItem('BlogsJwt');
		if(ls_jwt !== null) {
			let options = {
				headers: {
				    'Authorization': 'Bearer ' + ls_jwt
				},			
			};
			axios.get('https://junk.pr0con.io:8000/api/auth/verify/local', options).then((res) => {			
				if('Code' in res.data && 'Success' in res.data) {
					setMessages((pm) => ([ ...pm, { code: res.data.Code, msgs: [ ...res.data.Success ]} ]));
					setJwt(ls_jwt);
					setUser(res.data.data);
					setLoading(false);
				}	
			}, (error) => {
				//console.log('Type Of: ', typeof(error.response));
				if(!(typeof(error.response) == 'undefined')) {
					setLoading(false);
					setMessages((pm) => ([ ...pm, { code: error.response.status, msgs: [ error.response.statusText, 'Local token crappy.','Removing Local Stroage Token']} ]));
					window.localStorage.removeItem('BlogsJwt');
				}	
			});		
		} else {
			setLoading(false);
			setMessages((pm) => ([ ...pm, { code: '700', msgs: [ 'No Local Token Found.' ]} ]));
		}
	},[]);
	
	
	useEffect(() => {
		if(users !== null) {
			setSelectedUser(users[0]['_id']);
			setSelectedUserRole(users[0]['role']);
		}
	},[users]);
	
	//If token is fresh loading will be false and jwt wont be null
	useEffect(() => {
		if(loading === false && jwt !== null) {
			//console.log(jwt);
			
			let options = {
				headers: {
				    'Authorization': 'Bearer ' + jwt
				},			
			};
			axios.get('https://junk.pr0con.io:8000/api/auth/verify/fresh', options).then((res) => {	
				if('Code' in res.data && 'Success' in res.data) {
					setLoading(false);
					setMessages((pm) => ([ ...pm, { code: res.data.Code, msgs: [ ...res.data.Success ]} ]));
				}				
			}, (error) => {
				if(!(typeof(error.response) == 'undefined')) {
					setJwt(null);
					setUser(null);					
					window.localStorage.removeItem('BlogsJwt');
					setMessages((pm) => ([ ...pm, { code: error.response.status, msgs: [ error.response.statusText, 'Fresh token crappy.' ]} ]));					
				}
			});		
		}	
	},[jwt]);	
	
	const getCategories = () => {
		axios.get('https://junk.pr0con.io:8000/api/categories').then((res) => {
			//console.log(res);
			if('Code' in res.data && 'Success' in res.data) {
				setMessages((pm) => ([ ...pm, { code: res.data.Code, msgs: [ ...res.data.Success ]} ]));
				setCategories(res.data.catz.categories)
			}			
		}, (error) => {
			if(typeof(error.response.data) == 'object') {
				if('Code' in error.response.data && 'Error' in error.response.data) {
					setMessages((pm) => ([ ...pm, { code: error.response.data.Code, msgs: [ ...error.response.data.Error ]} ]));
					(parseInt(error.response.data.Code) === 601) ? doLogOut() : '';
				}
			}
		});			
	}
	useEffect(() => {
		getCategories();
	},[]);		
		
	return(
		<StyledBlogs>
			<div className="board-split-view">
				<div className="board-debugger">
					<div  className={`debugger ${debug['application-debugger']}`}><ReactJson src={{ user, profile, updateUserInput, loading, loginInput, registerInput, selectedCategory, categories }} collapsed={false} theme="apathy" /></div>
					<div  className={`debugger ${debug['users-debugger']}`}><ReactJson src={{ selectedUser, selectedUserRole, users }} collapsed={false} theme="apathy" /></div>					
				
					
					<div className="board-messages-container">
						<div className="board-messages-title">Messages</div>
						<div className="board-messages-messages">
							{ messages.length > 0 && messages.map((msgObj) => (
								<div className="board-messages-message-row" key={uniqid()}>
									<div className="board-messages-message-row-code">{ ( parseInt(msgObj.code) < 700 ) ? <span style={{ color: '#cc3300' }}>{ msgObj.code }</span> : <span style={{ color: '#9FD86B' }}>{ msgObj.code }</span> }</div>
									<div className="flex-row-filler"></div>
									<div className="board-messages-message-row-msgs">
										{ msgObj.msgs.length > 0 && msgObj.msgs.map((msg) => (
											<div className="board-messages-message-row-msg" key={uniqid()}>{ msg }</div>
										))}
									</div>
								</div>
							))}	
						</div>
					</div>					
				</div>
				<div className="board-blocks-grid">
					<BlogLoginForm  setLoginInput={setLoginInput} formData={loginInput} setMessages={setMessages} user={user} loading={loading} setLoading={setLoading} setUser={setUser} setJwt={setJwt} />
					<BlogRegisterForm setRegisterInput={setRegisterInput} formData={registerInput} setMessages={setMessages}  user={user} loading={loading} setUser={setUser} setJwt={setJwt} />					
					{ (user !== null) &&
						<>
							<ProfileForm jwt={jwt} user={user} setMessages={setMessages} setUpdateUserInput={setUpdateUserInput} profile={profile} setProfile={setProfile} setUsers={setUsers}/>
						</>
					}
					{(user !== null && user['role'] == "admin") && 
						<>
							<UserAdminForm jwt={jwt} setUsers={setUsers} setMessages={setMessages} doLogOut={doLogOut} users={users} setUsers={setUsers} selectedUser={selectedUser} setSelectedUser={setSelectedUser}  selectedUserRole={selectedUserRole} setSelectedUserRole={setSelectedUserRole} />							
							<CategoriesForm  jwt={jwt} setMessages={setMessages}  doLogOut={doLogOut} categories={categories}  setCategories={setCategories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />						
							<TagsForm jwt={jwt} setMessages={setMessages}  doLogOut={doLogOut}  categories={categories}  setCategories={setCategories} selectedCategory={selectedCategory} />						
						</>	
					}
				</div>
			</div>
			<div className="board-actions">	
				<svg onClick={(e) => setDebug({'application-debugger': 'active'}) } aria-hidden="true" focusable="false" data-prefix="fal" data-icon="spider" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className="svg-inline--fa fa-spider fa-w-18 fa-2x"><path fill="currentColor" d="M574.7 352.5l-54.8-82.2c-5.9-8.9-15.9-14.2-26.6-14.2H379.5l90.1-30c6.8-2.3 12.6-6.7 16.5-12.6l56.5-84.8c2.5-3.7 1.5-8.6-2.2-11.1l-13.3-8.9c-3.7-2.5-8.6-1.5-11.1 2.2l-55 82.5c-1 1.5-2.4 2.6-4.1 3.1l-83.1 27.7L426.9 118c5.8-11.4 6.7-24.5 2.6-36.7L404.2 5.5c-1.4-4.2-5.9-6.5-10.1-5.1l-15.2 5.1c-4.2 1.4-6.5 5.9-5.1 10.1l25.3 75.8c1.4 4 1.1 8.4-.9 12.2l-36.5 73.1-4.1-20.5c-2.2-11-17.4-60.1-69.6-60.1s-67.4 49.2-69.6 60.1l-4.1 20.5-36.5-73.1c-1.9-3.8-2.3-8.2-.9-12.2l25.3-75.8c1.4-4.2-.9-8.7-5.1-10.1L181.9.4c-4.2-1.4-8.7.9-10.1 5.1l-25.3 75.8c-4.1 12.2-3.1 25.2 2.6 36.7l53.1 106.2-83.1-27.7c-1.7-.6-3.1-1.7-4.1-3.1l-55-82.5c-2.4-3.7-7.4-4.7-11.1-2.2l-13.3 8.9c-3.7 2.4-4.7 7.4-2.2 11.1l56.5 84.8c3.9 5.9 9.8 10.4 16.5 12.6l90.1 30H82.8c-10.7 0-20.7 5.3-26.6 14.2L1.3 352.5c-2.5 3.7-1.5 8.6 2.2 11.1l13.3 8.9c3.7 2.5 8.6 1.5 11.1-2.2l52.4-78.7c1.5-2.2 4-3.6 6.7-3.6h102.1l-69.8 111.7c-4.8 7.6-7.3 16.4-7.3 25.5V504c0 4.4 3.6 8 8 8h16c4.4 0 8-3.6 8-8v-81.1c0-1.5.4-3 1.2-4.2l46.9-75.1c0 1-.2 2-.2 3 0 53.1 40.8 101.4 96 101.4s96-48.4 96-101.4c0-1-.1-2-.1-3l46.9 75.1c.8 1.3 1.2 2.7 1.2 4.2V504c0 4.4 3.6 8 8 8h16c4.4 0 8-3.6 8-8v-78.8c0-9-2.5-17.8-7.3-25.5L386.9 288H489c2.7 0 5.2 1.3 6.7 3.6l52.4 78.7c2.4 3.7 7.4 4.7 11.1 2.2l13.3-8.9c3.6-2.5 4.6-7.5 2.2-11.1zM288 416c-39.5 0-64-36-64-69.4 0-36.8 3.7-73.7 10.9-109.7l14.9-74.4c.7-3.5 7.8-34.4 38.2-34.4s37.5 30.9 38.2 34.4l14.9 74.4c7.2 36.1 10.9 72.9 10.9 109.7 0 33.4-24.5 69.4-64 69.4z"></path></svg>
				<svg onClick={(e) => setDebug({'users-debugger': 'active' })}       aria-hidden="true" focusable="false" data-prefix="fal" data-icon="users-cog" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="svg-inline--fa fa-users-cog fa-w-20 fa-2x"><path fill="currentColor" d="M287.4 250.6c2.9-10.4 6.5-20.4 10.9-30-33.6-9.5-58.4-40.1-58.4-76.7 0-44.1 35.9-80 80-80 36.6 0 67.1 24.8 76.7 58.4 9.6-4.4 19.6-8.1 30-10.9C412.6 65.6 370.4 32 320 32c-61.9 0-112 50.1-112 112 0 50.4 33.6 92.6 79.4 106.6zM96 224c44.2 0 80-35.8 80-80s-35.8-80-80-80-80 35.8-80 80 35.8 80 80 80zm0-128c26.5 0 48 21.5 48 48s-21.5 48-48 48-48-21.5-48-48 21.5-48 48-48zm61.1 172.9c-11.9-8.1-26-12.9-41.1-12.9H76c-41.9 0-76 35.9-76 80 0 8.8 7.2 16 16 16s16-7.2 16-16c0-26.5 19.8-48 44-48h40c5.5 0 10.8 1.2 15.7 3.3 7.5-8.5 16.1-16 25.4-22.4zM176 448c-8.8 0-16-7.2-16-16v-44.8c0-16.6 4.9-32.7 14.1-46.4 13.8-20.5 38.4-32.8 65.7-32.8 14.3 0 18.8 2.4 40.7 7.2-.2-3.8-1.4-13.4.6-32.6-16.3-4.3-26.4-6.6-41.3-6.6-36.3 0-71.6 16.2-92.3 46.9-12.4 18.4-19.6 40.5-19.6 64.3V432c0 26.5 21.5 48 48 48h209c-16-8.6-30.6-19.5-43.5-32H176zm304-208.5c-35.6 0-64.5 29-64.5 64.5s28.9 64.5 64.5 64.5 64.5-29 64.5-64.5-28.9-64.5-64.5-64.5zm0 97c-17.9 0-32.5-14.6-32.5-32.5s14.6-32.5 32.5-32.5 32.5 14.6 32.5 32.5-14.6 32.5-32.5 32.5zm148.3-10.2l-16.5-9.5c.8-8.5.8-17.1 0-25.6l16.6-9.5c9.5-5.5 13.8-16.7 10.5-27-7.2-23.4-19.9-45.4-36.7-63.5-7.4-8.1-19.3-9.9-28.8-4.4l-16.5 9.5c-7-5-14.4-9.3-22.2-12.8v-19c0-11-7.5-20.3-18.2-22.7-23.9-5.4-49.3-5.4-73.3 0-10.7 2.4-18.2 11.8-18.2 22.7v19c-7.8 3.5-15.3 7.8-22.2 12.8l-16.5-9.5c-9.5-5.5-21.3-3.7-28.7 4.4-16.8 18.1-29.4 40.1-36.7 63.4-3.3 10.4 1.2 21.8 10.6 27.2l16.5 9.5c-.8 8.5-.8 17.1 0 25.6l-16.6 9.5c-9.3 5.4-13.8 16.9-10.5 27.1 7.3 23.4 19.9 45.4 36.7 63.5 7.4 8 19.2 9.8 28.8 4.4l16.5-9.5c7 5 14.4 9.3 22.2 12.8v19c0 11 7.5 20.3 18.2 22.7 12 2.7 24.3 4 36.6 4s24.7-1.3 36.6-4c10.7-2.4 18.2-11.8 18.2-22.7v-19c7.8-3.5 15.2-7.8 22.2-12.8l16.5 9.5c9.4 5.4 21.3 3.6 28.7-4.4 16.8-18.1 29.4-40.1 36.7-63.4 3.4-10.4-1.1-21.9-10.5-27.3zm-51.6 7.2l29.4 17c-5.3 14.3-13 27.8-22.8 39.5l-29.4-17c-21.4 18.3-24.5 20.1-51.1 29.5v34c-15.1 2.6-30.6 2.6-45.6 0v-34c-26.9-9.5-30.2-11.7-51.1-29.5l-29.4 17c-9.8-11.8-17.6-25.2-22.8-39.5l29.4-17c-4.9-26.8-5.2-30.6 0-59l-29.4-17c5.2-14.3 13-27.7 22.8-39.5l29.4 17c21.4-18.3 24.5-20.1 51.1-29.5v-34c15.1-2.5 30.7-2.5 45.6 0v34c26.8 9.5 30.2 11.6 51.1 29.5l29.4-17c9.8 11.8 17.6 25.2 22.8 39.5l-29.4 17c4.9 26.8 5.2 30.6 0 59z" ></path></svg>					
				<div className="flex-row-filler"></div>
				<svg onClick={(e) => doLogOut()} aria-hidden="true" focusable="false" data-prefix="fal" data-icon="sign-out" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="svg-inline--fa fa-sign-out fa-w-16 fa-2x"><path fill="currentColor" d="M48 64h132c6.6 0 12 5.4 12 12v8c0 6.6-5.4 12-12 12H48c-8.8 0-16 7.2-16 16v288c0 8.8 7.2 16 16 16h132c6.6 0 12 5.4 12 12v8c0 6.6-5.4 12-12 12H48c-26.5 0-48-21.5-48-48V112c0-26.5 21.5-48 48-48zm279 19.5l-7.1 7.1c-4.7 4.7-4.7 12.3 0 17l132 131.4H172c-6.6 0-12 5.4-12 12v10c0 6.6 5.4 12 12 12h279.9L320 404.4c-4.7 4.7-4.7 12.3 0 17l7.1 7.1c4.7 4.7 12.3 4.7 17 0l164.5-164c4.7-4.7 4.7-12.3 0-17L344 83.5c-4.7-4.7-12.3-4.7-17 0z"></path></svg>									
			</div>
		</StyledBlogs>
	)
}