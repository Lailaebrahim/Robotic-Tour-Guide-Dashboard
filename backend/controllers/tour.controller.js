import asyncHandler from "express-async-handler";
import AppError from "../utils/error.js";
import Tour from "../models/tour.model.js";
import { join, dirname } from "path";
import path from "path";
import { readFileSync, writeFile, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import extractPublicPath from "../utils/extractPublicPath.js"
import axios from "axios";

export const getTours = asyncHandler(async (req, res) => {
  const { start, end, page = 1, limit = 10 } = req.query;

  let query = {};
  if (start && end) {
    query = {
      start: { $gte: start },
      end: { $lte: end },
    };
  }

  let tours;
  if (start && end) {
    tours = await Tour.find(query).sort({ createdAt: -1 });
  } else {
    tours = await Tour.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
  }

  res.status(200).jsend.success({ tours });
});

export const createTour = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    groupAvgAge,
    start,
    end,
    duration,
    maxGroupSize,
    language,
  } = req.body;
  const existingTour = await Tour.findOne({ start });
  if (existingTour) {
    return next(new AppError(400, "There is already a tour at this time"));
  }
  if (start > end) {
    return next(new AppError(400, "Start date should be before end date"));
  }
  if (start < new Date().toISOString()) {
    return next(new AppError(400, "Start date should be in the future"));
  }
  const user = req.user;
  const tour = await Tour.create({
    title,
    description,
    groupAvgAge,
    start,
    duration,
    end,
    maxGroupSize,
    language,
    createdBy: user._id,
  });
  res
    .status(201)
    .jsend.success({ message: "Tour Created Successfully !", tour });
});

export const updateTour = asyncHandler(async (req, res, next) => {
  const tourId = req.params.id;
  const {
    title,
    description,
    groupAvgAge,
    start,
    duration,
    end,
    maxGroupSize,
    language,
  } = req.body;
  const tour = await Tour.findById(tourId);
  if (!tour) {
    return next(new AppError(404, "Tour not found"));
  }
  if (tour.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError(403, "You are not allowed to update this tour"));
  }
  if (start < new Date().toISOString()) {
    return next(new AppError(400, "Start date should be in the future"));
  }
  if (title) tour.title = title;
  if (description) tour.description = description;
  if (groupAvgAge) tour.groupAvgAge = groupAvgAge;
  if (start) tour.start = start;
  if (duration) tour.duration = duration;
  if (end) tour.end = end;
  if (maxGroupSize) tour.maxGroupSize = maxGroupSize;
  if (language) tour.language = language;
  await tour.save();
  res
    .status(200)
    .jsend.success({ message: "Tour Updated Successfully !", tour });
});

export const deleteTour = asyncHandler(async (req, res, next) => {
  const tourId = req.params.id?.trim();

  // Attempt to find and delete the tour in one operation
  const deletedTour = await Tour.findByIdAndDelete(tourId);

  // Check if tour existed
  if (!deletedTour) {
    return next(new AppError(404, "Tour not found or already deleted"));
  }

  // Return success response
  return res.status(200).jsend.success({
    message: "Tour deleted successfully",
  });
});

export const getTourById = asyncHandler(async (req, res, next) => {
  const tourId = req.params.id;
  const tour = await Tour.findById(tourId);
  if (!tour) {
    return next(new AppError(404, "Tour not found"));
  }
  res.status(200).jsend.success({ tour });
});

export const generateTourAudio = asyncHandler(async (req, res, next) => {
  const tourId = req.params.id;
  const tour = await Tour.findById(tourId);
  if (!tour) {
    return next(new AppError(404, "Tour not found"));
  }
  const tourDescription = `Title: ${tour.title}.\nDescription: ${tour.description
    }\nLanguage: ${tour.language}\nGroup Average Age: ${tour.groupAvgAge
    } year \nGroup Size: ${tour.maxGroupSize} \nDuration: ${tour.duration
    } \nStart Date: ${tour.start} \nEnd Date: ${tour.end
    } \nTour Map:\n${Object.entries(tour.museumMap)
      .map(
        ([poi, val]) =>
          `${poi}: Artifact: ${val.name}\nDescription: ${val.description} \n`
      )
      .join("\n")}`;

  try {
    console.log("Generating audio for tour with id:", tourId);

    const ai_res = await axios.post(`${process.env.AI_API_GET_AUDIO_FILES}`);

    if (ai_res.status == 200) {

      let file = 1;

      console.log(ai_res.status);

      for (const [filename, base64Data] of Object.entries(ai_res.data)) {
        const buffer = Buffer.from(base64Data.replace(/^data:audio\/\w+;base64,/, ''), 'base64');
        const dirPath = fileURLToPath(dirname(import.meta.url));
        const outputFilePath = join(dirPath, `../../${process.env.PUBLIC_PATH}/tours_audio/${tourId}/${file}.mp3`);
        console.log(`Saving ${outputFilePath}`);
        try {
          await writeFile(outputFilePath, buffer, (err) => {
            if (err) throw err;
          });
          console.log(`Saved ${outputFilePath}`);
          // tour.museumMap[`POI_${file}`].audio = extractPublicPath(outputFilePath);
          const poiKey = `POI_${file}`;
          if (!tour.museumMap.get(poiKey)) {
            tour.museumMap.set(poiKey, { name: '', description: '' });
          }
          tour.museumMap.get(poiKey).audio = extractPublicPath(outputFilePath);
          file++;
        } catch (error) {
          console.log(`Error saving ${outputFilePath} ${error.message}`);
          return next(new AppError(500, `Error saving audio ${error.message}`));
        }

      }

      tour.isAudioGenerated = true;
      console.log(tour);

      await tour.save();

    } else {
      return next(
        new AppError(500, `Error generating audio ${ai_res.data.error}`)
      );
    }

    res
      .status(200)
      .jsend.success({ message: "Audio generated successfully !", tour });

  } catch (error) {
    return next(new AppError(500, `Error generating audio ${error.message}`));
  }
});
