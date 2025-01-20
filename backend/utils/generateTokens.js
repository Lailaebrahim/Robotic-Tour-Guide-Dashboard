/**
 * @description: This file contains the functions to generate the verification token, 
 *               activation token, access token, and refresh token.
 */
import jwt from "jsonwebtoken";


export const generateVerificationToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const generateActivationToken = (user) => {
  const activationToken = jwt.sign(
    { _id: user._id, email: user.email },
    process.env.ACTIVATION_TOKEN_SECRET_KEY,
    { expiresIn: process.env.ACTIVATION_TOKEN_EXPIRY }
  );
  return activationToken;
}

export const generateAccessRefreshToken = (user) => {
  const refreshToken = jwt.sign(
    { _id: user._id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET_KEY,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
  const accessToken = jwt.sign(
    { _id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
  return { accessToken , refreshToken};
};


export const generateTokensSetCookie = (user, res) => {
  const { refreshToken, accessToken } = generateAccessRefreshToken(user);
  res.cookie("JWT", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: parseInt(process.env.AUTH_COOKIE_MAX_AGE),
  });
  return {refreshToken, accessToken};
};