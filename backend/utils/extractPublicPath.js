const extractPublicPath = (fullPath) => {
    
    const publicIndex = fullPath.indexOf('public/');
    
    if (publicIndex === -1) {
        throw new Error("'public/' not found in the provided path");
    }

    return fullPath.substring(publicIndex + 'public/'.length);
}

export default extractPublicPath;
