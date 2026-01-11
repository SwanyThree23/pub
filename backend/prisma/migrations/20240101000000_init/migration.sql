-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'CREATOR', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('YOUTUBE', 'TWITCH', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER', 'TIKTOK', 'TELEGRAM', 'AMAZON', 'STEAM', 'KICK', 'RUMBLE');

-- CreateEnum
CREATE TYPE "StreamStatus" AS ENUM ('PREPARING', 'SCHEDULED', 'STARTING', 'LIVE', 'ENDING', 'ENDED', 'ERROR');

-- CreateEnum
CREATE TYPE "DestinationStatus" AS ENUM ('CONNECTING', 'CONNECTED', 'LIVE', 'DISCONNECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "VideoType" AS ENUM ('AVATAR', 'TRANSLATED', 'IMAGE_TO_VIDEO', 'FACE_SWAP', 'CUSTOM');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "keyName" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPlatform" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "platformUserId" TEXT,
    "platformUsername" TEXT,
    "streamKey" TEXT,
    "rtmpUrl" TEXT,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastStreamAt" TIMESTAMP(3),

    CONSTRAINT "UserPlatform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stream" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "StreamStatus" NOT NULL DEFAULT 'PREPARING',
    "vdoRoomId" TEXT,
    "vdoDirectorUrl" TEXT,
    "vdoGuestUrl" TEXT,
    "evmuxEventId" TEXT,
    "evmuxJobId" TEXT,
    "config" JSONB NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "totalViewers" INTEGER NOT NULL DEFAULT 0,
    "peakViewers" INTEGER NOT NULL DEFAULT 0,
    "totalMinutes" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamDestination" (
    "id" TEXT NOT NULL,
    "streamId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "status" "DestinationStatus" NOT NULL DEFAULT 'CONNECTING',
    "streamUrl" TEXT,
    "streamKey" TEXT,
    "viewerCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StreamDestination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamEvent" (
    "id" TEXT NOT NULL,
    "streamId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "platform" "Platform",
    "data" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreamEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "VideoType" NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "sourceData" JSONB NOT NULL,
    "jobId" TEXT,
    "provider" TEXT NOT NULL,
    "duration" INTEGER,
    "resolution" TEXT,
    "fileSize" INTEGER,
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceClone" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "voiceId" TEXT,
    "provider" TEXT NOT NULL,
    "sampleUrls" TEXT[],
    "previewUrl" TEXT,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "VoiceClone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "monthlyMinutes" INTEGER NOT NULL,
    "usedMinutes" INTEGER NOT NULL DEFAULT 0,
    "platformsLimit" INTEGER NOT NULL,
    "videosLimit" INTEGER NOT NULL,
    "priceId" TEXT,
    "customerId" TEXT,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceHealth" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastCheck" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseTime" INTEGER,
    "error" TEXT,
    "metadata" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueJob" (
    "id" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "QueueJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "ApiKey_userId_service_idx" ON "ApiKey"("userId", "service");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_userId_service_keyName_key" ON "ApiKey"("userId", "service", "keyName");

-- CreateIndex
CREATE INDEX "UserPlatform_userId_idx" ON "UserPlatform"("userId");

-- CreateIndex
CREATE INDEX "UserPlatform_platform_idx" ON "UserPlatform"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "UserPlatform_userId_platform_key" ON "UserPlatform"("userId", "platform");

-- CreateIndex
CREATE INDEX "Stream_userId_idx" ON "Stream"("userId");

-- CreateIndex
CREATE INDEX "Stream_status_idx" ON "Stream"("status");

-- CreateIndex
CREATE INDEX "Stream_scheduledAt_idx" ON "Stream"("scheduledAt");

-- CreateIndex
CREATE INDEX "StreamDestination_streamId_idx" ON "StreamDestination"("streamId");

-- CreateIndex
CREATE INDEX "StreamDestination_platform_idx" ON "StreamDestination"("platform");

-- CreateIndex
CREATE INDEX "StreamEvent_streamId_type_idx" ON "StreamEvent"("streamId", "type");

-- CreateIndex
CREATE INDEX "StreamEvent_timestamp_idx" ON "StreamEvent"("timestamp");

-- CreateIndex
CREATE INDEX "Video_userId_idx" ON "Video"("userId");

-- CreateIndex
CREATE INDEX "Video_type_idx" ON "Video"("type");

-- CreateIndex
CREATE INDEX "Video_status_idx" ON "Video"("status");

-- CreateIndex
CREATE INDEX "VoiceClone_userId_idx" ON "VoiceClone"("userId");

-- CreateIndex
CREATE INDEX "VoiceClone_provider_idx" ON "VoiceClone"("provider");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceHealth_service_key" ON "ServiceHealth"("service");

-- CreateIndex
CREATE INDEX "ServiceHealth_service_idx" ON "ServiceHealth"("service");

-- CreateIndex
CREATE INDEX "ServiceHealth_status_idx" ON "ServiceHealth"("status");

-- CreateIndex
CREATE INDEX "QueueJob_queueName_status_idx" ON "QueueJob"("queueName", "status");

-- CreateIndex
CREATE INDEX "QueueJob_createdAt_idx" ON "QueueJob"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "QueueJob_queueName_jobId_key" ON "QueueJob"("queueName", "jobId");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlatform" ADD CONSTRAINT "UserPlatform_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamDestination" ADD CONSTRAINT "StreamDestination_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamEvent" ADD CONSTRAINT "StreamEvent_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceClone" ADD CONSTRAINT "VoiceClone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
