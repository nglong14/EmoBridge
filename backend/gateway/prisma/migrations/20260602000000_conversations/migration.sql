-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New chat',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversation_userId_updatedAt_idx" ON "Conversation"("userId", "updatedAt");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add conversationId column as nullable first so we can backfill
ALTER TABLE "Message" ADD COLUMN "conversationId" TEXT;

-- Backfill: create one Conversation per user with existing messages, then assign
DO $$
DECLARE
    uid TEXT;
    cid TEXT;
BEGIN
    FOR uid IN SELECT DISTINCT "userId" FROM "Message" LOOP
        cid := concat('backfill_', gen_random_uuid()::text);
        INSERT INTO "Conversation" ("id", "userId", "title", "createdAt", "updatedAt")
        VALUES (cid, uid, 'New chat', NOW(), NOW());
        UPDATE "Message" SET "conversationId" = cid WHERE "userId" = uid;
    END LOOP;
END;
$$;

-- Now make conversationId NOT NULL
ALTER TABLE "Message" ALTER COLUMN "conversationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");
