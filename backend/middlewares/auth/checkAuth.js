/**
 * Middleware to check if the user is authenticated.
 * 
 * @param {Object} req - The request object.
 * @param {Object} _ - The response object (unused).
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {AppError} - Throws an error if authentication fails.
 * 
 * @description
 * This middleware checks for the presence of an authorization header in the request.
 * If the header is present, it verifies the access token and checks if the user exists
 * and is active. If any of these checks fail, an appropriate error is passed to the next
 * middleware.
 */
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import AppError from '../../utils/error.js';
import User from '../../models/user.model.js';


const isAuth = asyncHandler(async (req, _ , next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next(new AppError(401, "Unauthorized No AUTH header"));
    }
    const accessToken = authHeader.split(" ")[1];
    if (!accessToken) {
        return next(new AppError(401, "Unauthorized No Access token provided"));
    }
    try {
        const decodedJwt = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
        const user = await User.findById(decodedJwt._id);
        if (!user) {
            return next(new AppError(401, "Unauthorized No User Found"));
        }
        if (user.status !== "active") {
            return next(new AppError(403, "User Not Active"));
        }
        req.user = user;
        next();
    } catch(err){
        if (err.name === 'TokenExpiredError') {
            return next(new AppError(401, "Token expired, please refresh the access token"));
        } else {
            return next(new AppError(403, err.message));
        }
    }
});

export default isAuth;