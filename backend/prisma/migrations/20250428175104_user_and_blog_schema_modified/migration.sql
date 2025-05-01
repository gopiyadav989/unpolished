-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- First add columns as nullable
ALTER TABLE "User" 
ADD COLUMN "bio" TEXT,
ADD COLUMN "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "hashedPassword" TEXT,
ADD COLUMN "isAuthor" BOOLEAN DEFAULT false,
ADD COLUMN "profileImage" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3),
ADD COLUMN "username" TEXT;

-- Update existing rows with default values
UPDATE "User" SET 
  "createdAt" = CURRENT_TIMESTAMP,
  "username" = 'user_' || "id",
  "hashedPassword" = 'temporary_hash_to_be_updated',
  "updatedAt" = CURRENT_TIMESTAMP,
  "isAuthor" = false
WHERE "username" IS NULL;

-- Now make the columns NOT NULL
ALTER TABLE "User" ALTER COLUMN "createdAt" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "hashedPassword" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "isAuthor" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- Remove the password column after we've set up the hashedPassword column
ALTER TABLE "User" DROP COLUMN "password";

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");

-- CreateIndex
CREATE INDEX "Blog_authorId_idx" ON "Blog"("authorId");

-- CreateIndex
CREATE INDEX "Blog_published_idx" ON "Blog"("published");

-- CreateIndex
CREATE INDEX "Blog_slug_idx" ON "Blog"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;