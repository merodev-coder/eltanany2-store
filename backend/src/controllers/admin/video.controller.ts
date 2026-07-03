import { Request, Response } from 'express';
import Video from '../../models/admin/Video.model.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

// GET /api/v1/admin/videos
export const getAllVideos = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, category, search, isActive } = req.query;
  const filter: any = {};

  if (category) filter.category = category;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search as string, 'i')] } },
    ];
  }

  const videos = await Video.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await Video.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: videos,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// GET /api/v1/admin/videos/:id
export const getVideoById = catchAsync(async (req: Request, res: Response) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    throw new AppError('Video not found', 404);
  }
  res.status(200).json({ success: true, data: video });
});

// POST /api/v1/admin/videos
export const createVideo = catchAsync(async (req: Request, res: Response) => {
  const video = await Video.create(req.body);
  res.status(201).json({ success: true, data: video });
});

// PUT /api/v1/admin/videos/:id
export const updateVideo = catchAsync(async (req: Request, res: Response) => {
  const video = await Video.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!video) {
    throw new AppError('Video not found', 404);
  }
  res.status(200).json({ success: true, data: video });
});

// DELETE /api/v1/admin/videos/:id
export const deleteVideo = catchAsync(async (req: Request, res: Response) => {
  const video = await Video.findByIdAndDelete(req.params.id);
  if (!video) {
    throw new AppError('Video not found', 404);
  }
  res.status(200).json({ success: true, message: 'Video deleted successfully' });
});

// PATCH /api/v1/admin/videos/:id/views
export const incrementViews = catchAsync(async (req: Request, res: Response) => {
  const video = await Video.findByIdAndUpdate(
    req.params.id,
    { $inc: { viewCount: 1 } },
    { new: true }
  );
  if (!video) {
    throw new AppError('Video not found', 404);
  }
  res.status(200).json({ success: true, data: video });
});
