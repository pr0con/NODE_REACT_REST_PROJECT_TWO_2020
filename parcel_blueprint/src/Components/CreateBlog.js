import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios';
import styled from 'styled-components';
import ReactJson from 'react-json-view';
import uniqid from 'uniqid';
import { navigate } from 'hookrouter';

//npm install draft-js as well...
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

/* To Implement 
	import draftToHtml from 'draftjs-to-html';
	https://jpuri.github.io/react-draft-wysiwyg/#/demo
*/

const StyledCreateBlog = styled.div`
	border: 1rem solid rgba(1,1,1,1);
	max-height: calc(100vh - 11rem);
	overflow: scroll;	
	
	.board-single-form {
		padding: 1rem;
		width: 100%;		

		svg.unsaved-blog {
			width: 20rem;
			height: 20rem;
			position: relative;
			
			left: 50%;
			transform: translateX(-50%); 			
		}
		
		input {
			width: 100%;
		}
		textarea {
			width: 100%;
			height: 10rem;
			margin-top: 1rem;
			background: transparent;
			border:  1px solid rgba(9,81,105);
			color: rgba(83,186,131,1);
			padding: .5rem;
		}		
		#save-blog-warning {
			
		}
		
		#available-blog-images {
			border: 1px solid rgba(9,81,105,1);
			padding: .5rem;
			margin: 1rem 0rem 1rem 0rem;
			display: grid;
			grid-template-columns: minmax(100px, 200px) minmax(100px, 200px) minmax(100px, 200px);	
			
			.available-blog-image-wrapper {
				img {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}
				max-height: 10rem;
				overflow:hidden;
			}			
					
		}		
	}
	
	.rdw-editor-wrapper,
	.rdw-editor-main {
		height: auto;
		
		.rdw-image-modal-size {
			flex-direction: column;
		}
	}
	
	.rdw-image-modal,
	.rdw-emoji-modal {
		left: -200px;		
	}	
`;
import { FilePond_ } from './FilePond_.js';

export function CreateBlog() {
	const [ jwt, setJwt ] = useState(null);
	const [ user, setUser ] = useState(null);
	
	const [ tags, setTags ] = useState([]);
	const [ category, setCategory ] = useState('');
	
	const [ blogId, setBlogId ] = useState(null);
	const [ blogTitle, setBlogTitle ] = useState('');
	const [ blogDescription, setBlogDescription ] = useState('');
	
	const [ messages, setMessages ] = useState([]);
		
	const  getUrlParams = (search) => {
		let hashes = search.slice(search.indexOf('?') + 1).split('&')
		return hashes.reduce((params, hash) => {
			let [key, val] = hash.split('=')
			return Object.assign(params, {[key]: decodeURIComponent(val)})
		}, {})
	}
		
	useEffect(() => {
		//console.log(window.location.search)
		let params = getUrlParams(window.location.search);
		//console.log(params);
		
		setJwt(params['jwt']);
		setTags(params['tags'].split(','));
		setCategory(params['category']);
	},[]);
	
	useEffect(() => {
		if(jwt !== null) {
			let options = {
				headers: {
				    'Authorization': 'Bearer ' + jwt
				},			
			};				
			axios.get('https://junk.pr0con.io:8000/api/system/extract-user-from-jwt', options).then((res) => {
				//console.log(res);
				if('Code' in res.data && 'Success' in res.data) {
					setMessages((pm) => ([ ...pm, { code: res.data.Code, msgs: [ ...res.data.Success ]} ]));
					setUser(res.data.user)
				}			
			}, (error) => {
				if(typeof(error.response.data) == 'object') {
					if('Code' in error.response.data && 'Error' in error.response.data) {
						setMessages((pm) => ([ ...pm, { code: error.response.data.Code, msgs: [ ...error.response.data.Error ]} ]));
						(parseInt(error.response.data.Code) === 601) ?  navigate('/') : '';
					}
				}
			});				
		}
	},[jwt]);
	

	const handleInitBlog = () => {	
		if((blogTitle && blogDescription) != "" && (blogId === null)) {
					
			let options = {
				headers: {
				    'Authorization': 'Bearer ' + jwt
				},			
			};				
			axios.post('https://junk.pr0con.io:8000/api/blogs/new', { author: user._id, title: blogTitle, description: blogDescription, categories: [ { cat_title: category, cat_tags: [...tags] }], created: new Date() }, options).then((res) => {
				console.log(res);
				if('Code' in res.data && 'Success' in res.data) {
					setMessages((pm) => ([ ...pm, { code: res.data.Code, msgs: [ ...res.data.Success ]} ]));
					setBlogId(res.data.blogId);
				}			
			}, (error) => {
				if(typeof(error.response.data) == 'object') {
					if('Code' in error.response.data && 'Error' in error.response.data) {
						setMessages((pm) => ([ ...pm, { code: error.response.data.Code, msgs: [ ...error.response.data.Error ]} ]));
						(parseInt(error.response.data.Code) === 601) ? navigate('/') : '';
					}
				}
			});			
			
		}
	}
	
	/* React Draft with hooks */
	const [ editorState, setEditorState] = useState(null);	
	useEffect(() => {
		console.log(editorState);
	},[editorState]);	
	
	const [ frr, setFrr ] = useState(0); //force re-render header image...
	const [ frr2, setFrr2 ] = useState(0); //force / count new files


	const timeout = useRef(0);
	const [ availImages, setAvailImages ] = useState([]);
	const doneUploadingAvailImages  = () => {
		console.log('DoneUploadingAvailImages Called');
		let options = {
			headers: {
			    'Authorization': 'Bearer ' + jwt
			},			
		};			
		axios.get(`https://junk.pr0con.io:8000/api/blog/get/available/images/${blogId}`, options).then((res) => {
			if('Code' in res.data && 'Success' in res.data) {
				setMessages((pm) => ([ ...pm, { code: res.data.Code, msgs: [ ...res.data.Success ]} ]));
				console.log(res.data.availImages);
				if('availImages' in res.data && 'available_images' in res.data.availImages && res.data.availImages.available_images.length > 0) {
					for (let val in res.data.availImages.available_images) { //val == index
						(availImages.includes(res.data.availImages.available_images[val])) ? '' : availImages.push(res.data.availImages.available_images[val]);
					}
				} 
				
			}
		}, (error) => {
			if(!(typeof(error.response) == 'undefined')) {
				console.log('Something went horribly wrong...');
			}
		});	
	}	
	
	
	//PROBLEM HERE.. getting called twice.. figure this crap out....	
	useEffect(() => {
		if(blogId !== null) {
			clearTimeout(timeout.current)
			timeout.current = setTimeout(setTimeout(function () {
				doneUploadingAvailImages();				
		    }, 3000));		
		}
		return () => clearTimeout(timeout.current);	
	},[frr2]);
	
	return (
		<StyledCreateBlog>
			<div className="board-split-view">
				<div className="board-debugger">
					<ReactJson src={{ user, blogId,  category, tags, blogTitle, blogDescription }} collapsed={false} theme="apathy" />
					
					<div className="board-messages-container">
						<div className="board-messages-title">Messages</div>
						<div className="board-messages-messages">
							{ messages.length > 0 && messages.map((msgObj) => (
								<div className="board-messages-message-row" key={uniqid()}>
									<div className="board-messages-message-row-code">{ ( parseInt(msgObj.code) < 700)  ? <span style={{ color: '#cc3300' }}>{ msgObj.code }</span> : <span style={{ color: '#9FD86B' }}>{ msgObj.code }</span> }</div>
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
				<div className="board-single-form">
					<div className="form-title">Create Blog</div>
					{ blogId === null &&
						<svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="ban" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="unsaved-blog svg-inline--fa fa-ban fa-w-16 fa-9x"><path fill="currentColor" d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zM103.265 408.735c-80.622-80.622-84.149-208.957-10.9-293.743l304.644 304.643c-84.804 73.264-213.138 69.706-293.744-10.9zm316.37-11.727L114.992 92.365c84.804-73.263 213.137-69.705 293.743 10.9 80.622 80.621 84.149 208.957 10.9 293.743z" ></path></svg>						
					}
					{ blogId !== null &&
						<FilePond_ jwt={jwt} url="https://junk.pr0con.io:8000/api/blog/header/image/upload" id="filepond-blog-header-image" label="Upload Header Image"  setMessages={setMessages} setFrr={setFrr} hkv={{key: 'boid', value: blogId }}/>
					}
					
					<input type="text" name="blog-title" placeholder="Blog Title" onChange={(e) => setBlogTitle(e.target.value)} value={blogTitle}/>
					<textarea name="blog-description" onChange={(e) => setBlogDescription(e.target.value)} value={blogDescription} placeholder="Enter Blog Description"></textarea>
					{ blogId === null &&
						<div id="save-blog-warning">Save New Blog First: Enter Title and Description to unlock Header image and Content sectionns</div>
					}
					{ blogId !== null &&
						<>
							<Editor 
								editorState={editorState}
								onEditorStateChange={setEditorState}						
							/>
							<div className="form-sub-title">Available Images</div>
							<div id="available-blog-images">
								{ availImages.length > 0 && availImages.map((ai) =>(
									<div className="available-blog-image-wrapper"><img src={ai} /></div>
								))}								
							</div>	
							<FilePond_ jwt={jwt} url="https://junk.pr0con.io:8000/api/blog/available/images/upload" id="filepond-blog-images-upload" label="Upload Available Inline Images"  setMessages={setMessages} setFrr={setFrr2} hkv={{key: 'boid', value: blogId }} />												
						</>				
					}
				</div>
				
			</div>
			<div className="board-actions">	
				{ ((user && jwt) !== null) &&
					<div onClick={(e) => handleInitBlog()}> <svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="save" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="svg-inline--fa fa-save fa-w-14 fa-3x"><path fill="currentColor" d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM288 64v96H96V64h192zm128 368c0 8.822-7.178 16-16 16H48c-8.822 0-16-7.178-16-16V80c0-8.822 7.178-16 16-16h16v104c0 13.255 10.745 24 24 24h208c13.255 0 24-10.745 24-24V64.491a15.888 15.888 0 0 1 7.432 4.195l83.882 83.882A15.895 15.895 0 0 1 416 163.882V432zM224 232c-48.523 0-88 39.477-88 88s39.477 88 88 88 88-39.477 88-88-39.477-88-88-88zm0 144c-30.879 0-56-25.121-56-56s25.121-56 56-56 56 25.121 56 56-25.121 56-56 56z"></path></svg></div>											
				}
			</div>
		</StyledCreateBlog>
	)
}
