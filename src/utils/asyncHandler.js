 // promice method make rapper function for database way two
const asyncHandler = (requestHandler)=>{
    return (req , res , next) => {
        Promise.resolve(requestHandler(req , res , next)).catch((err)=> next(err)) 
    }

}
 export { asyncHandler }





    // try catch method make rapper function for database way one

    // const asyncHandler = (fn) => async (req , res , next) => {
    //     try {
    //         await fn(req , res , next)
            
    //     } catch (error) {
    //         res.status(err.code || 500).json({
    //             success: false,
    //             message: err.message
    //         })
            
    //     }

    // }