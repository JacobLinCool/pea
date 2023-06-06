-- CreateTable
CREATE TABLE "User" (
    "email" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT,
    "name" TEXT,
    "bio" TEXT,
    "avatar" TEXT
);

-- CreateTable
CREATE TABLE "MFA" (
    "user_email" TEXT NOT NULL PRIMARY KEY,
    "password" TEXT,
    "otp_secret" TEXT,
    CONSTRAINT "MFA_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "User" ("email") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_email" TEXT NOT NULL,
    "app_id" INTEGER NOT NULL,
    "curve_id" INTEGER NOT NULL,
    "payload" TEXT,
    CONSTRAINT "Token_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "User" ("email") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Token_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Token_curve_id_fkey" FOREIGN KEY ("curve_id") REFERENCES "Curve" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL,
    "accept_url" TEXT NOT NULL,
    "owner_email" TEXT NOT NULL,
    "allowlist" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "logo" TEXT,
    "color" TEXT,
    CONSTRAINT "Application_owner_email_fkey" FOREIGN KEY ("owner_email") REFERENCES "User" ("email") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Curve" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "crv" TEXT NOT NULL,
    "x" TEXT NOT NULL,
    "y" TEXT NOT NULL,
    "d" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Application_slug_key" ON "Application"("slug");
