import { v2 as cloudinary } from 'cloudinary';
import { fs } from "fs";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = async (localFilePath) => {
 try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
   const result = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
    })
    console.log("file is uploaded", result.url);
    return result;
    
 } catch (error) {
    fs.unlinkSync(localFilePath);//  remove the locally file from temporary file aas the upload failed
    return null  
 }
}

export { uploadCloudinary }





// cloudinary.v2.uploader.upload(
//     "https://",
//     {
//         public_id: "test",
//     },
//     function (error, result) {
//         console.log(result,);
//     }
// )