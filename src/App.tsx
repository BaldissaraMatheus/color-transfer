import React, { useState } from 'react';
import Toggle from './components/Toggle'
import Dropzone from './components/Dropzone';
import ResultCanvas from "./components/ResultCanvas";

const App: React.FC = () => {
	let [palletImageUrl, setPalletImageUrl] = useState<string|undefined>(undefined);
	let [targetImageUrl, setTargetImageUrl] = useState<string|undefined>(undefined);

	function onFileAddedPallet(file: any) {
		setPalletImageUrl(URL.createObjectURL(file));
  }

	function onFileAddedTarget(file: any) {
		setTargetImageUrl(URL.createObjectURL(file));
  }

	function changeTheme() {
		const htmlEl = document.getElementsByTagName('html')[0];
		htmlEl.classList.toggle('dark')
	}

	return (
		<main className="text-black dark:text-blue container mx-auto max-w-screen-xl flex flex-col px-4">
			<header className="mt-4 w-full flex justify-between items-center">
				<h1 className="text-4xl">Color Transfer</h1>
				<div>
					<h2 className="mb-2">Dark mode:</h2>
					<Toggle onClick={changeTheme} />
				</div>
			</header>
			<div className="w-full rounded mt-4 bg-blue dark:bg-purple dark:text-white p-3 flex">
				<div className="w-6 flex-shrink-0">
					💡
				</div>
				<div>
					This app in an implementation of the color transfer method described on&nbsp;
					<a href="https://www.cs.tau.ac.il/~turkel/imagepapers/ColorTransfer.pdf" className="text-purple dark:text-blue">Color Transfer Between Images</a> using WebGL.
					The source code is available <a href="https://github.com/BaldissaraMatheus/color-transfer" className="text-purple dark:text-blue">here</a>.
				</div>
			</div>
			<div className="flex mt-4 flex-col sm:flex-row full">
				<div className="mx-auto mb-4 sm:mr-4 sm:ml-0 sm:mb-0 flex flex-col items-center">
					<Dropzone
						label="Pallet Image"
						onFileAdded={onFileAddedPallet}
						backgroundImageUrl={palletImageUrl}
						id="pallet"
					/>
					<h4 className="mt-2 text-sm">Pallet Image</h4>
				</div>
				<div className="mt-4 mb-5 mx-auto sm:my-0 sm:ml-0 sm:mr-4 flex flex-col items-center">
					<Dropzone
						label="Target Image"
						onFileAdded={onFileAddedTarget}
						backgroundImageUrl={targetImageUrl}
						id="target"
					/>
					<h4 className="mt-2 text-sm">Target Image</h4>
				</div>
				{ palletImageUrl && targetImageUrl
					? <div className="my-4 mx-auto sm:mx-0 sm:my-0 flex flex-col items-center">
							<ResultCanvas urlPallet={palletImageUrl} urlTarget={targetImageUrl} className="full w-64 h-64" />
							<h4 className="mt-2 text-sm">Result Image</h4>
						</div>
					: <></>
				}
			</div>
		</main>
	)
}

export default App;