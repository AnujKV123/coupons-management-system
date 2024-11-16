import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import logger from "./logger.js";

const asyncHandler = (requestHandler) => async (req, res, next) => {
  try {
    await requestHandler(req, res, next);
  } catch (err) {
    if (err instanceof ApiError) {
      logger.error(
        JSON.stringify({ message: err.message, statusCode: err.statusCode })
      );
    } else {
      logger.error(err.stack);
    }
    // Returning status = 400 for mongo validation error
    const statusCode =
      err.statusCode ||
      (err.message?.includes("validation failed") ? 400 : 500);
    const errorResponse = new ApiResponse(statusCode, null, err.message, false);
    res.status(statusCode).json(errorResponse);
  }
};

export { asyncHandler };
