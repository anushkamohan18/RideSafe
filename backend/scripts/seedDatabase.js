const { PrismaClient, Role, Gender, VehicleType, RideStatus, EmergencyType, EmergencyStatus, MessageType } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (in correct order to respect foreign key constraints)
    console.log('🧹 Clearing existing data...');
    await prisma.rideRating.deleteMany();
    await prisma.emergencyReport.deleteMany();
    await prisma.message.deleteMany();
    await prisma.ride.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();

    // Create sample users
    console.log('👥 Creating sample users...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await Promise.all([
      // Passengers
      prisma.user.create({
        data: {
          email: 'passenger1@example.com',
          password: hashedPassword,
          name: 'John Doe',
          phone: '+1234567890',
          role: Role.PASSENGER,
          gender: Gender.MALE,
          dateOfBirth: new Date('1990-01-01'),
          profileImage: 'https://via.placeholder.com/150',
          address: 'Connaught Place, New Delhi',
          genderPreference: Gender.FEMALE,
          biometricEnabled: false,
        },
      }),
      prisma.user.create({
        data: {
          email: 'passenger2@example.com',
          password: hashedPassword,
          name: 'Jane Smith',
          phone: '+1234567891',
          role: Role.PASSENGER,
          gender: Gender.FEMALE,
          dateOfBirth: new Date('1992-05-15'),
          profileImage: 'https://via.placeholder.com/150',
          address: 'Red Fort, New Delhi',
          genderPreference: Gender.MALE,
          biometricEnabled: true,
        },
      }),
      // Drivers
      prisma.user.create({
        data: {
          email: 'driver1@example.com',
          password: hashedPassword,
          name: 'Mike Johnson',
          phone: '+1234567892',
          role: Role.DRIVER,
          gender: Gender.MALE,
          dateOfBirth: new Date('1985-03-20'),
          profileImage: 'https://via.placeholder.com/150',
          address: 'Karol Bagh, New Delhi',
          biometricEnabled: false,
        },
      }),
      prisma.user.create({
        data: {
          email: 'driver2@example.com',
          password: hashedPassword,
          name: 'Sarah Wilson',
          phone: '+1234567893',
          role: Role.DRIVER,
          gender: Gender.FEMALE,
          dateOfBirth: new Date('1988-12-10'),
          profileImage: 'https://via.placeholder.com/150',
          address: 'India Gate, New Delhi',
          biometricEnabled: true,
        },
      }),
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create vehicles for driver users
    console.log('🚗 Creating vehicle profiles...');
    
    const vehicles = await Promise.all([
      prisma.vehicle.create({
        data: {
          driverId: users[2].id, // Mike Johnson
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          plateNumber: 'DL01AB1234',
          color: 'Blue',
          vehicleType: VehicleType.SEDAN,
          isVerified: true,
        },
      }),
      prisma.vehicle.create({
        data: {
          driverId: users[3].id, // Sarah Wilson
          make: 'Honda',
          model: 'CR-V',
          year: 2021,
          plateNumber: 'DL02CD5678',
          color: 'White',
          vehicleType: VehicleType.SUV,
          isVerified: true,
        },
      }),
    ]);

    console.log(`✅ Created ${vehicles.length} vehicle profiles`);

    // Create sample rides
    console.log('🚕 Creating sample rides...');
    
    const rides = await Promise.all([
      // Completed ride
      prisma.ride.create({
        data: {
          riderId: users[0].id,
          driverId: users[2].id,
          pickupAddress: 'Connaught Place, New Delhi',
          pickupLatitude: 28.6315,
          pickupLongitude: 77.2167,
          dropAddress: 'India Gate, New Delhi',
          dropLatitude: 28.6129,
          dropLongitude: 77.2295,
          estimatedPrice: 250.00,
          actualPrice: 250.00,
          distance: 5.2,
          duration: 20,
          status: RideStatus.COMPLETED,
          requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          acceptedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000),
          startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
        },
      }),
      // In progress ride
      prisma.ride.create({
        data: {
          riderId: users[1].id,
          driverId: users[3].id,
          pickupAddress: 'Red Fort, New Delhi',
          pickupLatitude: 28.6562,
          pickupLongitude: 77.2410,
          dropAddress: 'Lotus Temple, New Delhi',
          dropLatitude: 28.5535,
          dropLongitude: 77.2588,
          estimatedPrice: 300.00,
          distance: 8.1,
          duration: 25,
          status: RideStatus.EN_ROUTE,
          requestedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          acceptedAt: new Date(Date.now() - 25 * 60 * 1000),
          startedAt: new Date(Date.now() - 20 * 60 * 1000),
        },
      }),
      // Pending ride
      prisma.ride.create({
        data: {
          riderId: users[0].id,
          pickupAddress: 'Karol Bagh, New Delhi',
          pickupLatitude: 28.6519,
          pickupLongitude: 77.1909,
          dropAddress: 'Select City Walk, Saket',
          dropLatitude: 28.5244,
          dropLongitude: 77.2066,
          estimatedPrice: 400.00,
          distance: 12.5,
          duration: 35,
          status: RideStatus.PENDING,
          requestedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        },
      }),
    ]);

    console.log(`✅ Created ${rides.length} sample rides`);

    // Create sample ratings for completed rides
    console.log('⭐ Creating sample ratings...');
    
    const ratings = await Promise.all([
      prisma.rideRating.create({
        data: {
          rideId: rides[0].id, // Completed ride
          raterId: users[0].id, // Rider rating driver
          ratedUserId: users[2].id, // Rating for driver Mike Johnson
          rating: 5,
          review: 'Excellent service! Very professional and punctual driver.',
        },
      }),
    ]);

    console.log(`✅ Created ${ratings.length} sample ratings`);

    // Create sample emergency reports
    console.log('🆘 Creating sample emergency reports...');
    
    const emergencyReports = await Promise.all([
      prisma.emergencyReport.create({
        data: {
          rideId: rides[1].id,
          reporterId: users[1].id,
          emergencyType: EmergencyType.ACCIDENT,
          description: 'Minor fender bender, no injuries reported',
          latitude: 28.5800,
          longitude: 77.2500,
          status: EmergencyStatus.RESOLVED,
          resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
      }),
    ]);

    console.log(`✅ Created ${emergencyReports.length} emergency reports`);

    // Create sample messages
    console.log('💬 Creating sample messages...');
    
    const messages = await Promise.all([
      prisma.message.create({
        data: {
          rideId: rides[1].id, // In progress ride
          senderId: users[1].id, // Passenger
          receiverId: users[3].id, // Driver
          content: 'I am waiting near the main gate',
          messageType: MessageType.TEXT,
          isRead: true,
          readAt: new Date(Date.now() - 10 * 60 * 1000),
        },
      }),
      prisma.message.create({
        data: {
          rideId: rides[1].id,
          senderId: users[3].id, // Driver
          receiverId: users[1].id, // Passenger
          content: 'I can see you, arriving in 2 minutes',
          messageType: MessageType.TEXT,
          isRead: false,
        },
      }),
    ]);

    console.log(`✅ Created ${messages.length} sample messages`);

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🚗 Vehicles: ${vehicles.length}`);
    console.log(`   🚕 Rides: ${rides.length}`);
    console.log(`   ⭐ Ratings: ${ratings.length}`);
    console.log(`   🆘 Emergency Reports: ${emergencyReports.length}`);
    console.log(`   💬 Messages: ${messages.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 