import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import dotenv from 'dotenv';

dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadCloudinary = async (localFilePath) => {
 try {
    if (!localFilePath) return null;
   //  console.log("local path :" , localFilePath);
    
    //upload the file on cloudinary
   const result = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
    })
   console.log("cloudinary result of uploaded images :", result.url);
   fs.unlinkSync(localFilePath);
    return result;
    
 } catch (error) {
   console.log("error of cloudanariy:",error);
   
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