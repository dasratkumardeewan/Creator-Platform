import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong while generating your tokens",
    );
  }
};

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

const login = asyncHandler(async (req, res) => {
  // get details - email or username password
  // check if user doesn't exists
  // compare password
  // access and refresh Token
  // set cookie
  // login

  const { username, email, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "Email Or Username is required");
  }

  if (!password || password?.trim() === "") {
    throw new ApiError(400, "Password Is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const passwordValidation = await user.isPasswordCorrect(password);

  if (!passwordValidation) {
    throw new ApiError(401, "Wrong Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User Logged In Successfully"));
});

const logout = asyncHandler(async (req, res) => {});

export { register, login };
