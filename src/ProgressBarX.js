import React from 'react'

export const ProgressBarX = ({bgcolor,progress,height}) => { 
	
	const Parentdiv = { 
		height: height, 
		width: '86%', 
		backgroundColor: 'lightgray', 
		borderRadius: 40, 
		margin: 50 
	} 
	
	const Childdiv = { 
		height: '100%', 
		width: `${progress}%`, 
		backgroundColor: bgcolor, 
	borderRadius:40, 
		textAlign: 'center'
	} 
	
	const progresstext = { 
		padding: 10, 
		color: 'black', 
		fontWeight: 900 
	} 
		
	return ( 
	<div style={Parentdiv}> 
	<div style={Childdiv}> 
		<span style={progresstext}>{`${progress}%`}</span> 
	</div> 
	</div> 
	); 
} 
export default ProgressBarX;
