import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponce.js";


// creating method for creating Access token and refresh token

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating tokens");
    }

}



const registerUser = asyncHandler(async (req, res) => {
    // steps to register user 
    // one get details from frontend
    // check validtion is there any field missing or not
    // check if user is already exist or not
    // check for image , avatar and cover image
    // upload image on cloudinary
    // create user in database
    //remove password from and refresh token from responce
    //check fro user creation
    // return responce

    const { fullname, username, email, password } = req.body
    if (
        [fullname, username, email, password].some((field) =>
            !field || field.trim() === "")
    ) { throw new ApiError(400, "All fields are required"); }

    const exitedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (exitedUser) {
        throw new ApiError(409, "User with username or email already exist");
    }
    const avatarLocalpath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // console.log(avatarLocalpath); 

    // agr user cover image upload nh krta to undefined ka error ahrha tha thats why we use optional chaining and handle that error
    let coverImageLocalPath;
    if (req.files?.coverImage && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    if (!avatarLocalpath) {
        throw new ApiError(400, "Avatar local path is required");
    }

    const avatar = await uploadCloudinary(avatarLocalpath);
    const coverImage = await uploadCloudinary(coverImageLocalPath);
    // console.log(avatar);

    if (!avatar) {
        throw new ApiError(400, "Avatar is required");
    }

    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken").lean();

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user");
    }
    // return res.status(201).json(new ApiResponse(200, "User created successfully", createdUser));
    const response = new ApiResponse(createdUser, 200, "User created successfully");
    console.log("Response Object:", response);
    res.status(201).json(response);

})

const loginUser = asyncHandler(async (req, res) => {
    // req body se data longa
    // username or email hain ya nh
    // user find kareengeee exist hain ya nh
    // password check kareengee
    // acces token aur refresh token generate kareengee
    // send token user in cookies

    // step one get data from frontend
    const { email, password, username } = req.body;
    if (!email && !username) {
        throw new ApiError(400, "Email and username are required");
    }

    // step two find user in database
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    //  step three check password
    const isPasswordCorrect = await user.isPasswordMatched(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Password is incorrect");
    }

    // step four generate access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    //  update or get user with tokens 
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken").lean();

    // send tokens in cookies

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse( 200, { user: loggedInUser, accessToken, refreshToken }, "Login successful"));
});
    
const logoutUser = asyncHandler(async (req, res) => {
 await User.findByIdAndUpdate(req.user._id, 
      {
        $set: {
            refreshToken: undefined,
        }
      },{
        new: true
      }
);

const options = {
    httpOnly: true,
    secure: true,
}

return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200, {}, "Logout successful"))



})




export { registerUser, loginUser , logoutUser} ;