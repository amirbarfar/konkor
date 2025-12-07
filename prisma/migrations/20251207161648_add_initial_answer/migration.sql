-- CreateTable
CREATE TABLE "InitialAnswer" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InitialAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InitialAnswer_sessionId_key" ON "InitialAnswer"("sessionId");
