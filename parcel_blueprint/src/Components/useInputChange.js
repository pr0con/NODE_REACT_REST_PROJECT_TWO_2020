import { useState } from 'react';

export const useInputChange = () => {
	const [input, setInput] = useState({})
	
	const handleInputChange = (e, clear) => {
		if(clear !== true) {
			setInput({
				...input,
				[e.currentTarget.name]: e.currentTarget.value
			});
		} else {
			setInput({});
		}
	}
	
	return [input, handleInputChange]
}