-- CreateEnum
CREATE TYPE "Role" AS ENUM ('RIDER', 'DRIVER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('SEDAN', 'SUV', 'HATCHBACK', 'BIKE', 'AUTO');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EN_ROUTE', 'PICKED_UP', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmergencyType" AS ENUM ('ACCIDENT', 'UNSAFE_DRIVER', 'ROUTE_DEVIATION', 'HARASSMENT', 'VEHICLE_BREAKDOWN', 'OTHER');

-- CreateEnum
CREATE TYPE "EmergencyStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'LOCATION', 'CALL_REQUEST', 'SYSTEM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'RIDER',
    "gender" "Gender",
    "profileImage" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "genderPreference" "Gender",
    "biometricEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL DEFAULT 'SEDAN',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rides" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "driverId" TEXT,
    "pickupLatitude" DOUBLE PRECISION NOT NULL,
    "pickupLongitude" DOUBLE PRECISION NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "dropLatitude" DOUBLE PRECISION NOT NULL,
    "dropLongitude" DOUBLE PRECISION NOT NULL,
    "dropAddress" TEXT NOT NULL,
    "status" "RideStatus" NOT NULL DEFAULT 'PENDING',
    "estimatedPrice" DOUBLE PRECISION,
    "actualPrice" DOUBLE PRECISION,
    "distance" DOUBLE PRECISION,
    "duration" INTEGER,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "rides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ride_ratings" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "ratedUserId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ride_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_reports" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "emergencyType" "EmergencyType" NOT NULL,
    "description" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "EmergencyStatus" NOT NULL DEFAULT 'ACTIVE',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_driverId_key" ON "vehicles"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plateNumber_key" ON "vehicles"("plateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ride_ratings_rideId_key" ON "ride_ratings"("rideId");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rides" ADD CONSTRAINT "rides_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rides" ADD CONSTRAINT "rides_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ride_ratings" ADD CONSTRAINT "ride_ratings_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ride_ratings" ADD CONSTRAINT "ride_ratings_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ride_ratings" ADD CONSTRAINT "ride_ratings_ratedUserId_fkey" FOREIGN KEY ("ratedUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_reports" ADD CONSTRAINT "emergency_reports_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_reports" ADD CONSTRAINT "emergency_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
