import mongoose from "mongoose";
import museumMap from "../utils/museumMap.js";

const tourSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        groupAvgAge:{
            type: Number,
            required: true
        },
        start: {
            type: Date,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        end:{
            type: Date,
            required: true,
        },
        allDay:{
            type: Boolean,
            default: false
        },
        maxGroupSize: {
            type: Number,
            required: true,
        },
        language: {
            type: String,
            required: true,
        },
        museumMap:{
            type: Object,
            default: museumMap
        },
        isAudioGenerated: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
});


export default mongoose.model("Tour", tourSchema);