import { z } from 'zod';

// User validation
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Stream validation
export const startStreamSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  platforms: z.array(z.object({
    id: z.string(),
    enabled: z.boolean()
  })),
  scenes: z.array(z.any()).optional(),
  aiEnabled: z.boolean().default(false),
  enableVDO: z.boolean().optional(),
  enableEvMux: z.boolean().optional(),
  eventId: z.string().optional(),
  avatar: z.object({
    id: z.string(),
    script: z.string(),
    voiceId: z.string()
  }).optional(),
  voice: z.object({
    sampleUrl: z.string(),
    name: z.string()
  }).optional(),
  translation: z.object({
    languages: z.array(z.string())
  }).optional(),
  scheduledAt: z.string().datetime().optional()
});

// Platform validation
export const connectPlatformSchema = z.object({
  platformId: z.string(),
  platformUserId: z.string().optional(),
  platformUsername: z.string().optional(),
  streamKey: z.string().optional(),
  rtmpUrl: z.string().url().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional()
});

// Content validation
export const avatarVideoSchema = z.object({
  avatarId: z.string(),
  voiceId: z.string(),
  script: z.string().min(1, 'Script is required'),
  resolution: z.enum(['720p', '1080p', '4k']).optional()
});

export const translateVideoSchema = z.object({
  videoUrl: z.string().url('Invalid video URL'),
  targetLanguage: z.string(),
  voiceClone: z.boolean().optional()
});

export const imageToVideoSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  prompt: z.string().min(1, 'Prompt is required'),
  resolution: z.enum(['720p', '1080p', '4k']).optional()
});

export const voiceCloneSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  audioFiles: z.array(z.string().url()),
  description: z.string().optional()
});

// API Key validation
export const apiKeySchema = z.object({
  service: z.string(),
  keyName: z.string(),
  apiKey: z.string().min(1, 'API key is required')
});

// Validation middleware
export const validate = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }
      next(error);
    }
  };
};
