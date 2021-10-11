import React, { useState } from 'react';

interface ToggleProps {
	onClick: React.MouseEventHandler;
}

const Toggle: React.FC<ToggleProps> = (props: ToggleProps) => {
	let [active, setActive] = useState(false);

	function handleOnClick(event: React.MouseEvent<Element, MouseEvent>) {
		setActive(!active);
		props.onClick(event)
	}

	return (
		<button
			onClick={handleOnClick}
			className={
				`w-20 h-9 rounded-full border-2 border-black dark:border-blue px-1 pt-1 flex justify-${active ? 'end' : 'start'}`
			}
		>
			<div className="w-6 h-6 bg-black dark:bg-blue rounded-full">

			</div>
		</button>
	)
}

export default Toggle;
