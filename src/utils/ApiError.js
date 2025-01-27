
class ApiError extends Error {
    constructor(
        satatusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""  
    ){
        super(message)
        this.statusCode = satatusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }


}

export { ApiError }