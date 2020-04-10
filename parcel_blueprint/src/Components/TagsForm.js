import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components';
import axios from 'axios';
import { navigate } from 'hookrouter'; //export this for use everywhere

const StyledTagsForm = styled.div`
	padding: 1rem;
	border: 1px solid rgba(9,81,105);
	
	#category-tags {
		position: relative;
        display: grid;
		grid-gap: 10px;
        grid-template-columns: repeat(4, [col] 100px ) ;
        grid-template-rows: repeat(3, [row] auto  );
        
    	.site-category-tag {
	       	position: relative;
	    	height: 1.5rem;
	    	text-align: center;
	    	border: 1px solid rgba(9,81,105);
	    	
	    	&:hover {
		    	cursor: pointer;
		    	background: rgba(9,81,105);
		    	color: #000;
		    }
		    	    	
		    .category-tag-kill-switch {
				position: absolute;
				width: 1.2rem;
				height: 1.2rem;
				background: url('/images/cross.png');
				background-size: 1.2rem 1.2rem;
				background-position: center center;
				transform: rotate(45deg);
				right: .2rem;			    
			} 	 	    				
        }			
	}
	
	#selected-category-tags {
		position: relative;
        display: grid;
		grid-gap: 10px;
        grid-template-columns: repeat(4, [col] 100px ) ;
        grid-template-rows: repeat(3, [row] auto  );
        
        .selected-category-tag {
	       	position: relative;
	    	height: 1.5rem;
	    	text-align: center;
	    	border: 1px solid rgba(9,81,105);	        
			background: #fff;
			color: #000;	
			
			&:hover {
				cursor:pointer;
			} 
			
			.selected-category-tag-kill-switch {
				position: absolute;
				width: 1.2rem;
				height: 1.2rem;
				background: url('/images/cross.png');
				background-size: 1.2rem 1.2rem;
				background-position: center center;
				transform: rotate(45deg);
				right: .2rem;			
			}   	    		    	      
	    }		
	}
	
	#form-custom-button {
		width: 100%;
		background: rgba(9,81,105);
		color: #000;
		text-align:center;
		padding: 1rem;	
		border-radius: 2px;
		
		&:hover{
			cursor:pointer;
			background: #fff;
		}
	}		
`;

export function TagsForm({ jwt, setMessages, doLogOut, categories, setCategories, selectedCategory }) {
	const formEl = useRef(null);
	
	const [ newTagz, setNewTagz ] = useState('');	
	const [ catTagz, setCatTagz ] = useState([]);
	const [ selectedTagz, setSelectedTagz ] = useState([]);	
	
	const handleSubmit = (e) => {
		if(selectedCategory != "") {
			e.preventDefault();
			let options = {
				headers: {
				    'Authorization': 'Bearer ' + jwt
				},			
			}
			axios.get(`https://junk.pr0con.io:8000/api/system/update/category/tags/add?category=${selectedCategory}&tags=${newTagz}`,options).then((res) => {
				console.log(res);
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

			setNewTagz([]);
			formEl.current.reset();			
		}	
	}
	
	useEffect(() =>{
		if(selectedCategory !== "") {
			//find nested object by slug in categories array of objects
			let obj = categories.find(o => o.slug === selectedCategory);
			setCatTagz(obj.tags);
			setSelectedTagz([]);
		}else {
			(catTagz.length > 0) ? setCatTagz([]) : '';
			(selectedTagz.length > 0) ? setSelectedTagz([]) : '';
		}
	},[selectedCategory, categories]);
	
	const handleSelectTag = (tag) => {
		( selectedTagz.includes(tag) ) ? '' : setSelectedTagz([...selectedTagz, tag]);
	}
	
	const handleRemoveCategoryTag = (e, tag) => {
		e.stopPropagation();
		let options = {
			headers: {
			    'Authorization': 'Bearer ' + jwt
			},			
		}
		axios.delete(`https://junk.pr0con.io:8000/api/system/update/category/tags/remove?category=${selectedCategory}&tag=${tag}`,options).then((res) => {
			console.log(res);
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
	
	const handleRemoveSelectedCategoryTag = (tag) => {
		setSelectedTagz(selectedTagz.filter(item => item !== tag));
	}
	
	const handleCreateBlog = () => {
		if(selectedTagz.length === 0) {
			setMessages((pm) => ([ ...pm, { code: 600, msgs: [ 'Need to select category & tags' ]} ]));
		} else {
			let tags = selectedTagz.join(",");
			navigate('/CreateBlog',false, {category:selectedCategory, tags:tags, jwt:jwt});	
		}	
	}
	
	return(
		<StyledTagsForm>
			<div className="form-title">Tags -> <span className="tag-parent-category-title">{ selectedCategory }</span></div>
			<form ref={formEl} onSubmit={(e) => handleSubmit(e)}>
				<input type="text" name="tags" onChange={(e) => setNewTagz(e.target.value)} placeholder="Comma seperated list."/>
				<div className="form-actions">
					<div className="flex-row-filler"></div>
					<input type="submit" value="Submit" />	
				</div>					
			</form>
			<div className="form-splitter"></div>
			<div id="category-tags">
				{ (catTagz.length > 0) && catTagz.map((tag) => (
					<div className={`site-category-tag ${tag}`} onClick={(e) => handleSelectTag(tag)}>
						{tag}
						<span className="category-tag-kill-switch" onClick={(e) => handleRemoveCategoryTag(e, tag) }></span>
					</div>					
				))}
			</div>
			<div className="form-splitter"></div>
			<div id="selected-category-tags">
				{ selectedTagz.length > 0 && selectedTagz.map((tag) => (
					<div className="selected-category-tag">
						{tag}
						<span className="selected-category-tag-kill-switch" onClick={(e) => handleRemoveSelectedCategoryTag(tag) }></span>
					</div>
				))}
			</div>	
			<div className="form-splitter"></div>
			<div id="form-custom-button" onClick={(e) => handleCreateBlog(e)}>Create Blog w/ Tags</div>			
		</StyledTagsForm>
	)					
}