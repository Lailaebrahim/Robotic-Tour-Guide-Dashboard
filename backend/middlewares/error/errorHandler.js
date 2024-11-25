/**
 * Middleware to handle errors in the application.
 * 
 * @param {Object} error - The error object is an instance of the custom error `AppError` class.
 * @param {Object} _ - The request object (not used).
 * @param {Object} res - The response object.
 * 
 * @returns {void}
 * 
 * @description
 * This middleware function handles errors that occur during the execution of the application.
 * It differentiates between client errors (status codes 400-499) and server errors (status codes 500 and above).
 * 
 * For client errors, it responds with a status code of the error or 400, and a `jsend.fail` response containing
 * the error message and details.
 * 
 * For server errors, it responds with a status code of the error or 500, and a `jsend.error` response containing
 * the error message and details.
 */
import asyncHandler from 'express-async-handler';

const errorHandler = (error, req, res, next) => {
    if (error.statusCode >= 400 && error.statusCode < 500) {
      res.status(error.statusCode || 400).jsend.fail({
        message: error.message || "Client Error",
        details: error.details || null,
      });
    } else {
      res
        .status(error.statusCode || 500)
        .jsend.error({
          message: error.message || "Internal Server Error",
          details: error.details || null,
        });
    }
  };

export default errorHandler;