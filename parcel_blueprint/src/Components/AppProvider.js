import React, { useEffect, useState, createContext, useContext } from 'react';
export const AppContext = createContext();


export default function(props) {
	
	return(
		<AppContext.Provider value={{ 
			
		}}>
			
			{ props.children }
		</AppContext.Provider>				
	)
}