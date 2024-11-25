/**
 * Custom error class extending the built-in Error class.
 */
export default class AppError extends Error {
    /**
     * Creates an instance of AppError.
     * 
     * @param statusCode - The HTTP status code of the error
     * @param message - The error message
     * @param details - Additional details about the error (optional)
     */
    constructor(statusCode, message, details=null) {
      super(message);
      
      // ensure the name of the error is AppError
      this.name = this.constructor.name;
  
      this.statusCode = statusCode;
      this.details = details;
  
      // ensures the stack trace is captured correctly
      Error.captureStackTrace(this, this.constructor);
    }
  }