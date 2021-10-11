import React from 'react';

interface DropzoneProps {
	label: string;
	id: string;
	onFileAdded: (file: any) => void;
	backgroundImageUrl?: string;
	className?: string;
}

const Dropzone: React.FC<DropzoneProps> = (props: DropzoneProps) => {
	function onDragOverHandler(event: React.DragEvent<HTMLDivElement>) {
		event.preventDefault();
    event.stopPropagation();
	}

	function onDropHandler(event: React.DragEvent<HTMLDivElement>) {
		event.preventDefault();
    event.stopPropagation();
		const files = event.dataTransfer?.files || []
		props.onFileAdded(files[0]);
	}

	function onChangeHandler(event: React.ChangeEvent<HTMLDivElement>) {
		const target = event.target as HTMLInputElement;
    const files = target?.files || [];
		props.onFileAdded(files[0]);
	}

	function onClickHandler(event: any) {
		const input = document.getElementById(props.id);
		console.log(input);
		input?.click();
	}

	function buildLabelDiv(label: string) {
		return (
			<div className="flex flex-col justify-center items-center my-auto h-full">
				<div className="text-center mb-4">{label}</div>
				<div className="text-center text-sm">Click here to upload an image or drag and drop from the file explorer</div>
			</div>
		);
	}

	return (
		<div
			onDragOver={onDragOverHandler}
			onDrop={onDropHandler}
			onClick={onClickHandler}
			className={`w-64 h-64 border cursor-pointer ${props.className}`}
			style={props.backgroundImageUrl
				? {
					backgroundImage: `url(${props.backgroundImageUrl})`,
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
					backgroundSize: 'cover',
				}
				: {}
			}
		>
			<input
				type="file"
				accept=".jpg,.jpeg,.png"
				id={props.id}
				className="hidden"
				onChange={onChangeHandler}
			/>
			{ props.backgroundImageUrl ? <></> : buildLabelDiv(props.label) }
		</div>
	)
}

export default Dropzone;