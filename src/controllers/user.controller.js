import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponce.js";


const registerUser = asyncHandler( async (req, res) => {
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
           !field|| field.trim() === "")
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

 const user =  await User.create({
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

export { registerUser }