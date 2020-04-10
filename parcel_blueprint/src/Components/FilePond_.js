import React, { useState, useContext } from 'react';
import styled from 'styled-components';

import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";

// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview );

//ondata to alter the data submitted to the server. Use onload to make a selection from the response.
//DELETE /api/profile/image 404 2.875 ms - 159 <-- sent if image x'd 
//hkv = header key value obj
export function FilePond_({ id, label, url, jwt, uoid, setMessages, setFrr, hkv }) { 
	
	const [files, setFiles] = useState([]);
	return (
		<div id={id}>
			<FilePond 
				files={files}
				allowMultiple={true}
				onupdatefiles={setFiles}
				labelIdle={label}
				server={{
					url: url,
					headers: {
						[`${hkv.key}`]: hkv.value,
	                    Authorization: 'Bearer ' + jwt
	                },
	                process: {
		                onload: (res) => {
			            	let response_data = JSON.parse(res);
			            	console.log(response_data);
			                
			                if('Success' in response_data) {
				                setMessages((pm) => ([ ...pm, { code: response_data.Code, msgs: [ ...response_data.Success ]} ]));
				                setFrr((ffr) => ffr + 1)
			                }			            	
			            },
			            onerror: (error) => {
				        	let response_data = JSON.parse(error);
			                console.log(response_data);
							
							if('Error' in response_data) {
				                setMessages((pm) => ([ ...pm, { code: response_data.Code, msgs: [ ...response_data.Error ]} ]));
			                }				        	 
				        }
		            },    					
			    }}
			    allowFileEncode={true}
			/>    				
		</div>
	)
	
}