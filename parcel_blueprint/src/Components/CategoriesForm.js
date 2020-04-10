import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components';
import axios from 'axios';

const StyledCategoriesForm = styled.div`
	position: relative;
	padding: 1rem;
	border: 1px solid rgba(9,81,105);	
	
	#site-categories {
		position: relative;
		display: grid;
		grid-gap: 1rem;
		
		grid-template-columns: repeat(4, [col] 100px );
		grid-template-rows: repeat(3, [row] auto  );
		
		.site-category {
	       	position: relative;
	    	height: 1.5rem;
	    	text-align: center;
	    	border: 1px solid rgba(9,81,105);	
	    				
	    	&:hover {
		    	cursor: pointer;
		    	background: rgba(9,81,105);
		    	color: #000;
		    }

		    &.${(props) => props.selectedCategory} {
				background: #fff;
				color: #000;
			}		    
		    	    				
			.category-kill-switch {
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
`;



export function CategoriesForm({ jwt, setMessages, doLogOut, categories, setCategories, selectedCategory, setSelectedCategory }) {
	const formEl = useRef(null);
	
	const [ newCatz, setNewCatz ] = useState('');
	
	const handleSubmit = (e) => {
		e.preventDefault();
		let options = {
			headers: {
			    'Authorization': 'Bearer ' + jwt
			},			
		}
		axios.get(`https://junk.pr0con.io:8000/api/system/update/categories/add?categories=${newCatz}`,options).then((res) => {
			console.log(res);
			if('Code' in res.data && 'Success' in res.data) {
				setMessages((pm) => ([ ...pm, { code: res.data.Code, msgs: [ ...res.data.Success ]} ]));
				setCategories(res.data.catz.categories);
			}			
		}, (error) => {
			if(typeof(error.response.data) == 'object') {
				if('Code' in error.response.data && 'Error' in error.response.data) {
					setMessages((pm) => ([ ...pm, { code: error.response.data.Code, msgs: [ ...error.response.data.Error ]} ]));
					(parseInt(error.response.data.Code) === 601) ? doLogOut() : '';
				}
			}
		});
		setNewCatz([]);
		formEl.current.reset();					
	}
	
	const handleRemoveCategory = (e,category) => {
		e.stopPropagation();
		
		(category == selectedCategory) ? setSelectedCategory('') : '';
		
		let options = {
			headers: {
			    'Authorization': 'Bearer ' + jwt
			},			
		}
		axios.delete(`https://junk.pr0con.io:8000/api/system/update/categories/remove?category=${category}`, options).then((res) => {
			console.log(res);
			if('Code' in res.data && 'Success' in res.data) {
				setMessages((pm) => ([ ...pm, { code: res.data.Code, msgs: [ ...res.data.Success ]} ]));
				setCategories(res.data.catz.categories);
			}			
		}, (error) => {
			//may want to send blank catz array back to clear system if no cat response....
			if(typeof(error.response.data) == 'object') {
				if('Code' in error.response.data && 'Error' in error.response.data) {
					setMessages((pm) => ([ ...pm, { code: error.response.data.Code, msgs: [ ...error.response.data.Error ]} ]));
					(parseInt(error.response.data.Code) === 601) ? doLogOut() : '';
				}
			}
		});			
				
	}
	
	return(
		<StyledCategoriesForm selectedCategory={selectedCategory}>
			<div className="form-title">Categories</div>
			<form ref={formEl} onSubmit={(e) => handleSubmit(e)}>
				<input type="text" name="categories" onChange={(e) => setNewCatz(e.target.value)} placeholder="Comma seperated list."/>
				<div className="form-actions">
					<div className="flex-row-filler"></div>
					<input type="submit" value="Submit" />	
				</div>				
			</form>
			<div className="form-splitter"></div>
			<div id="site-categories">
				{ categories.length > 0 && categories.map((cat) => (
					<div className={`site-category ${cat.slug}`} onClick={(e) => setSelectedCategory(cat.slug)}>
						{cat.slug}
						<span className="category-kill-switch" onClick={(e) => handleRemoveCategory(e, cat.slug) }></span>
					</div>
				))}
			</div>
		</StyledCategoriesForm>
	)
}		





	