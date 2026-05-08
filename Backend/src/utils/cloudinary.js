import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

console.log(process.env.CLOUDINARY_API_SECRET);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (fileLocalPath) => {
  try {
    const response = await cloudinary.uploader.upload(fileLocalPath, {
      resource_type: "auto",
    });
    console.log(
      "The file has been Uploaded On Cloudinary. URL: ",
      response.secure_url,
    );
    return response;
  } catch (error) {
    if (fileLocalPath) {
      fs.unlinkSync(fileLocalPath);
    }
    console.log(
      error?.message || "Something went wrong whiel uploading on cloudinary",
    );
    return null;
  }
};

export default uploadOnCloudinary;
