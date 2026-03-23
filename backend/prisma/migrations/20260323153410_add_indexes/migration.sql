-- DropIndex
DROP INDEX "users_createdAt_idx";

-- DropIndex
DROP INDEX "users_role_idx";

-- CreateIndex
CREATE INDEX "users_role_isActive_createdAt_idx" ON "users"("role", "isActive", "createdAt");
