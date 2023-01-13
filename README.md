# Color Transfer Between Images
![image](https://user-images.githubusercontent.com/19363147/137603569-e7f5abb2-4897-4a45-b2da-e6bb21237acb.png)
This an implementation of the color transfer method [Color Transfer Between Images](https://www.cs.tau.ac.il/~turkel/imagepapers/ColorTransfer.pdf) made with WebGL. The user interface was created with React, Typescript and TailwindCSS.

You can experiment it on [here](https://6163d99efb0bc600072ea2b1--blissful-mestorf-5654ad.netlify.app/).

## To be improved
The overall performance is still pretty bad, it works fine with small images (I tested images with the resolution 100x100 from https://source.unsplash.com/random/100x100), but for images that are much bigger WebGL loses its context and the browser may crash. Also the quality of the result images are far from the ones presented on the original paper.

## Development
In order the run this repo locally, run `npm install` and `npm start`. If npm shows an error, try using a different Node version with nvm. All the logic present in the original paper is within the file ResultCanvas.tsx.