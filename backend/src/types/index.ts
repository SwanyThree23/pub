// Type Definitions for Unified Platform

export interface ServiceConfig {
  name: string;
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
}

export interface StreamConfig {
  title?: string;
  description?: string;
  eventId?: string;
  platforms: PlatformConfig[];
  scenes?: SceneConfig[];
  aiEnabled: boolean;
  enableVDO?: boolean;
  enableEvMux?: boolean;
  avatar?: AvatarConfig;
  voice?: VoiceConfig;
  translation?: TranslationConfig;
  scheduledAt?: Date;
}

export interface PlatformConfig {
  id: string;
  enabled: boolean;
  rtmpUrl?: string;
}

export interface SceneConfig {
  name: string;
  sources: SourceConfig[];
}

export interface SourceConfig {
  name: string;
  type: string;
  settings: any;
}

export interface StreamSession {
  id: string;
  userId: string;
  status: 'starting' | 'live' | 'ended' | 'error';
  platforms: PlatformConnection[];
  startTime: Date;
  endTime?: Date;
  config: StreamConfig;
  vdoRoom?: VDORoom;
  error?: string;
}

export interface PlatformConnection {
  platform: string;
  streamUrl: string;
  streamKey: string;
  status: string;
  viewers?: number;
}

export interface VDORoom {
  id: string;
  directorUrl: string;
  guestUrl: string;
  viewUrl: string;
}

export interface AvatarConfig {
  id: string;
  script: string;
  voiceId: string;
}

export interface VoiceConfig {
  sampleUrl: string;
  name: string;
}

export interface TranslationConfig {
  languages: string[];
}

export type ContentType = 'avatar-video' | 'translated-video' | 'image-to-video' | 'voice-clone';

export interface AvatarVideoParams {
  userId: string;
  avatarId: string;
  voiceId: string;
  script: string;
  resolution?: string;
}

export interface TranslationParams {
  userId: string;
  videoUrl: string;
  targetLanguage: string;
  voiceClone?: boolean;
}

export interface ImageToVideoParams {
  userId: string;
  imageUrl: string;
  prompt: string;
  resolution?: string;
}

export interface VoiceCloneParams {
  userId: string;
  name: string;
  audioFiles: string[];
  description?: string;
}

export interface EvMuxDestination {
  name: string;
  rtmp_url: string;
  rtmp_key: string;
}

export interface EvMuxConfig {
  eventId: string;
  destinations: EvMuxDestination[];
}
