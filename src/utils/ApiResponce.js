class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.success = statusCode < 400;  // ✅ Yahan `success` true/false set ho raha hai
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
    }
}

export { ApiResponse };