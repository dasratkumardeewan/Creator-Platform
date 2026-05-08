import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const register = asyncHandler(async (req, res) => {
  // get user details
  // validate - empty
  // check if user already exists
  // check for images - avatar
  // check if images are uploaded on cloudinary - avatar
  // create a user object

  const { fullName, email, username, bio, password } = req.body;
  if (
    [fullName, email, username, password, bio].some(
      (fields) => fields?.trim() === "",
    )
  ) {
    throw new ApiError(400, "All Fields Are Required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(400, "User with email or username Already Exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(
      500,
      "Something went wrong while uploading file on cloudinary",
    );
  }

  let coverImage;
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }

  const createdUser = await User.create({
    username,
    fullName,
    bio,
    email,
    avatar: avatar.secure_url,
    coverImage: coverImage?.secure_url || "",
    password,
  });

  const user = await User.findById(createdUser._id).select(
    "-password -refreshToken",
  );

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User Registered Successfully"));
});

export { register };
