import { Types } from 'mongoose';
const { ObjectId } = Types;

export default (req, res, next, id) => {
    if (!ObjectId.isValid(id)) {
      return res.status(400).jsend.fail({ message: "Invalid ID" });
    }
    next();
};