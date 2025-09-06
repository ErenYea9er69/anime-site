-- CreateTable
CREATE TABLE "ImageCache" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "animeId" INTEGER NOT NULL,
    "blob" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImageCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EpisodeCache" (
    "id" TEXT NOT NULL,
    "animeId" INTEGER NOT NULL,
    "episode" INTEGER NOT NULL,
    "sources" JSONB NOT NULL,
    "subtitles" JSONB,
    "quality" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EpisodeCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "setting" JSONB,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchListEpisode" (
    "id" TEXT NOT NULL,
    "aniId" TEXT,
    "title" TEXT,
    "aniTitle" TEXT,
    "image" TEXT,
    "episode" INTEGER,
    "timeWatched" INTEGER,
    "duration" INTEGER,
    "provider" TEXT,
    "nextId" TEXT,
    "nextNumber" INTEGER,
    "dub" BOOLEAN,
    "createdDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "userProfileId" TEXT NOT NULL,
    "watchId" TEXT NOT NULL,

    CONSTRAINT "WatchListEpisode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImageCache_url_key" ON "ImageCache"("url");

-- CreateIndex
CREATE INDEX "ImageCache_animeId_idx" ON "ImageCache"("animeId");

-- CreateIndex
CREATE UNIQUE INDEX "EpisodeCache_animeId_episode_key" ON "EpisodeCache"("animeId", "episode");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_name_key" ON "UserProfile"("name");

-- AddForeignKey
ALTER TABLE "WatchListEpisode" ADD CONSTRAINT "WatchListEpisode_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("name") ON DELETE CASCADE ON UPDATE CASCADE;
