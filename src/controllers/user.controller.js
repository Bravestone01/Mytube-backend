import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken";


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
    //check for user creation
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
    //console.log(createdUser);

    return res.status(201).json(new ApiResponse(200, "User created successfully", createdUser));


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
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Login successful"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        }, {
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

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incommingRefreshToken) {
        throw new ApiError(401, "Unathorized Request");
    }
    try {
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "invalid refresh token");
        }
        if (incommingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expiry or Used");
        }
        const options = {
            httpOnly: true,
            secure: true,
        }

        const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user._id)
        return res
            .status(200)
            .cookie("accessToken :", accessToken, options)
            .cookie("refreshToken :", newrefreshToken, options)
            .json(
                new ApiResponce(
                    200,
                    {
                        accessToken, newrefreshToken
                    },
                    "access token and refrsh token successfully create"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message, "heloo" || "invalid refresh token catch by catch");


    }
});


const chnageCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorect) {
        throw new ApiError(400, "inCorrect your Password retry");
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password successfully update"))
})

const getCureentUser = asyncHandler(async (req, res) => {

    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "user Successfully fatched "))
})

const updateUserDetails = asyncHandler(async (req, res) => {

    const { fullname, email } = req.body
    if (!fullname || !email) {
        throw new ApiError(400, " All fields are required");
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email,
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details is updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, "Erorr while uploading Avatar please try again");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "avatar image succefully update"))

})

const updateUserCoverImage = asyncHandler(async (req, res) => {

    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, " coverImage is missing ");
    }

    const coverImage = await uploadCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400, "Erorr while uploading coverImage please try again ");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "cover Image is succesfully update "))

})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    //  get user name
    const { username } = req.params
    if (!username?.trim()) {
        throw new ApiError(400, " username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        }, {
            subscribersCount: {
                $size: "$subscribers"
            },
            channelsSubscriberToCount: {
                $size: "$subscribedTo"
            },
            isSubscribed:{
                $cond:{
                    if:{$in : [req.user?._id , "$subscribers.subscriber"]},
                    then:true,
                    else:false,
                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                subscribersCount:1,
                channelsSubscriberToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1,

            }
        }


    ])
    if (channel?.length) {
        throw new ApiError(404, "channel does not exists");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "user channel fetched succesfully ")
    )

})

const getWatchHistory = asyncHandler (async (req, res)=>{
const user = await User.aggregate([
    {
        $match:{
            _id: new mongoose.Types.ObjectId(req.user._id)
        }
    },{
        $lookup:{
            from: "videos",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[
                {
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[
                            $project:{
                                fullname:1,
                                username:1,
                                avatar:1,
                            }
                        ]
                    }
                },{
                    $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                    }
                }
            ]
        }
    }
])
return res
.status(200)
.json(new ApiResponse(200, user[0].watchHistory , "watch histroy successfully get done" ))
})

export {
    registerUser, loginUser,
    logoutUser, refreshAccessToken,
    getCureentUser, chnageCurrentPassword,
    updateUserDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile,
    getWatchHistory
};