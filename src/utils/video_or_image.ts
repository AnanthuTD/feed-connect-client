export const isVideoFile = (fileName:string) => {
	const videoExtensionsRegex = /\.(mp4|webm|ogg)$/i;
	return videoExtensionsRegex.test(fileName);
};

export const isImageFile = (fileName:string) => {
	const imageExtensionsRegex = /\.(jpg|jpeg|png|gif)$/i;
	return imageExtensionsRegex.test(fileName);
};
