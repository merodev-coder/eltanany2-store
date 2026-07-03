import { adminMongoose, adminDb } from '../../config/db.js';
import type { Model, Document, Types } from 'mongoose';

export interface IVideo extends Document {
 _id: Types.ObjectId;
 title: string;
 description?: string;
 thumbnail: string;
 videoUrl: string;
 youtubeUrl?: string;
 isYoutube: boolean;
 category: 'tutorial' | 'review' | 'unboxing' | 'comparison' | 'other';
 tags: string[];
 viewCount: number;
 isActive: boolean;
 createdAt: string;
 updatedAt: string;
}

const videoSchema = new adminMongoose.Schema({
 title: {
 type: String,
 required: [true, 'Title is required'],
 trim: true,
 maxlength: [200, 'Title cannot exceed 200 characters'],
 },
 description: {
 type: String,
 trim: true,
 maxlength: [1000, 'Description cannot exceed 1000 characters'],
 },
 thumbnail: {
 type: String,
 required: [true, 'Thumbnail is required'],
 },
 videoUrl: {
 type: String,
 required: [true, 'Video URL is required'],
 },
 youtubeUrl: {
 type: String,
 },
 isYoutube: {
 type: Boolean,
 default: false,
 },
 category: {
 type: String,
 enum: ['tutorial', 'review', 'unboxing', 'comparison', 'other'],
 default: 'other',
 },
 tags: [
 {
 type: String,
 trim: true,
 },
 ],
 viewCount: {
 type: Number,
 default: 0,
 },
 isActive: {
 type: Boolean,
 default: true,
 },
}, { timestamps: true });

const Video = adminDb.model<IVideo>('Video', videoSchema);

export default Video;
