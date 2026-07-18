-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "doctorName" TEXT NOT NULL,
    "doctorShortBio" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "regularHours" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScheduleSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "session" TEXT NOT NULL,
    "quota" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "queueNumber" INTEGER NOT NULL,
    "patientName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "complaint" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "session" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "slotId" TEXT NOT NULL,
    CONSTRAINT "Booking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ScheduleSlot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyCounter" (
    "date" DATETIME NOT NULL PRIMARY KEY,
    "lastNumber" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleSlot_date_session_key" ON "ScheduleSlot"("date", "session");

-- CreateIndex
CREATE INDEX "Booking_date_status_idx" ON "Booking"("date", "status");
