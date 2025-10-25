import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const seedData = {
  pricing: [
    {
      title: 'Basic Membership',
      price: '29.99',
      description:
        'Access to gym equipment during regular hours. Perfect for beginners and casual fitness enthusiasts.',
    },
    {
      title: 'Premium Membership',
      price: '49.99',
      description:
        'Full gym access + group classes + locker rental. Great for those who want variety in their workouts.',
    },
    {
      title: 'Elite Membership',
      price: '79.99',
      description:
        'Everything in Premium + personal training sessions + nutrition consultation + 24/7 access.',
    },
    {
      title: 'Student Discount',
      price: '19.99',
      description:
        'Special rate for students with valid ID. Basic membership benefits at an affordable price.',
    },
  ],

  timetable: [
    // Monday
    {
      day: 'Monday',
      className: 'Morning Yoga',
      startTime: '07:00',
      endTime: '08:00',
      instructor: 'Sarah Johnson',
      capacity: 15,
    },
    {
      day: 'Monday',
      className: 'HIIT Training',
      startTime: '09:00',
      endTime: '10:00',
      instructor: 'Mike Rodriguez',
      capacity: 12,
    },
    {
      day: 'Monday',
      className: 'Strength Training',
      startTime: '18:00',
      endTime: '19:00',
      instructor: 'David Chen',
      capacity: 10,
    },
    {
      day: 'Monday',
      className: 'Zumba',
      startTime: '19:30',
      endTime: '20:30',
      instructor: 'Maria Garcia',
      capacity: 20,
    },

    // Tuesday
    {
      day: 'Tuesday',
      className: 'Pilates',
      startTime: '07:30',
      endTime: '08:30',
      instructor: 'Lisa Wong',
      capacity: 12,
    },
    {
      day: 'Tuesday',
      className: 'CrossFit',
      startTime: '09:00',
      endTime: '10:00',
      instructor: 'Jake Thompson',
      capacity: 8,
    },
    {
      day: 'Tuesday',
      className: 'Cardio Blast',
      startTime: '18:00',
      endTime: '19:00',
      instructor: 'Emma Davis',
      capacity: 15,
    },
    {
      day: 'Tuesday',
      className: 'Yoga Flow',
      startTime: '19:30',
      endTime: '20:30',
      instructor: 'Sarah Johnson',
      capacity: 15,
    },

    // Wednesday
    {
      day: 'Wednesday',
      className: 'Boot Camp',
      startTime: '07:00',
      endTime: '08:00',
      instructor: 'Mike Rodriguez',
      capacity: 12,
    },
    {
      day: 'Wednesday',
      className: 'Spin Class',
      startTime: '09:00',
      endTime: '10:00',
      instructor: 'Alex Turner',
      capacity: 16,
    },
    {
      day: 'Wednesday',
      className: 'Functional Training',
      startTime: '18:00',
      endTime: '19:00',
      instructor: 'David Chen',
      capacity: 10,
    },
    {
      day: 'Wednesday',
      className: 'Meditation & Stretch',
      startTime: '19:30',
      endTime: '20:30',
      instructor: 'Lisa Wong',
      capacity: 20,
    },

    // Thursday
    {
      day: 'Thursday',
      className: 'Morning Cardio',
      startTime: '07:00',
      endTime: '08:00',
      instructor: 'Emma Davis',
      capacity: 15,
    },
    {
      day: 'Thursday',
      className: 'Olympic Lifting',
      startTime: '09:00',
      endTime: '10:00',
      instructor: 'Jake Thompson',
      capacity: 6,
    },
    {
      day: 'Thursday',
      className: 'Circuit Training',
      startTime: '18:00',
      endTime: '19:00',
      instructor: 'Mike Rodriguez',
      capacity: 12,
    },
    {
      day: 'Thursday',
      className: 'Latin Dance',
      startTime: '19:30',
      endTime: '20:30',
      instructor: 'Maria Garcia',
      capacity: 18,
    },

    // Friday
    {
      day: 'Friday',
      className: 'Power Yoga',
      startTime: '07:30',
      endTime: '08:30',
      instructor: 'Sarah Johnson',
      capacity: 15,
    },
    {
      day: 'Friday',
      className: 'HIIT Blast',
      startTime: '09:00',
      endTime: '10:00',
      instructor: 'Alex Turner',
      capacity: 12,
    },
    {
      day: 'Friday',
      className: 'Weekend Warrior',
      startTime: '18:00',
      endTime: '19:00',
      instructor: 'David Chen',
      capacity: 10,
    },
    {
      day: 'Friday',
      className: 'Social Fitness',
      startTime: '19:30',
      endTime: '20:30',
      instructor: 'Emma Davis',
      capacity: 20,
    },

    // Saturday
    {
      day: 'Saturday',
      className: 'Weekend Yoga',
      startTime: '09:00',
      endTime: '10:00',
      instructor: 'Lisa Wong',
      capacity: 20,
    },
    {
      day: 'Saturday',
      className: 'Family Fitness',
      startTime: '10:30',
      endTime: '11:30',
      instructor: 'Maria Garcia',
      capacity: 25,
    },
    {
      day: 'Saturday',
      className: 'Strength & Conditioning',
      startTime: '14:00',
      endTime: '15:00',
      instructor: 'Jake Thompson',
      capacity: 12,
    },
    {
      day: 'Saturday',
      className: 'Dance Cardio',
      startTime: '16:00',
      endTime: '17:00',
      instructor: 'Alex Turner',
      capacity: 18,
    },

    // Sunday
    {
      day: 'Sunday',
      className: 'Gentle Yoga',
      startTime: '09:00',
      endTime: '10:00',
      instructor: 'Sarah Johnson',
      capacity: 20,
    },
    {
      day: 'Sunday',
      className: 'Recovery Stretch',
      startTime: '10:30',
      endTime: '11:30',
      instructor: 'Lisa Wong',
      capacity: 15,
    },
    {
      day: 'Sunday',
      className: 'Open Gym',
      startTime: '14:00',
      endTime: '16:00',
      instructor: 'Staff Supervised',
      capacity: 50,
    },
  ],

  ptPackages: [
    {
      name: 'Starter Package',
      sessions: 4,
      price: '200.00',
      description:
        'Perfect for beginners. 4 one-on-one sessions to learn proper form and create a personalized workout plan.',
      duration: '60 minutes per session',
    },
    {
      name: 'Transformation Package',
      sessions: 8,
      price: '360.00',
      description:
        'Comprehensive 8-session program focused on achieving your fitness goals with nutrition guidance.',
      duration: '60 minutes per session',
    },
    {
      name: 'Elite Performance',
      sessions: 12,
      price: '500.00',
      description:
        'Advanced training program for serious athletes. Includes performance testing and specialized workouts.',
      duration: '75 minutes per session',
    },
    {
      name: 'Couples Training',
      sessions: 6,
      price: '300.00',
      description:
        'Train together, stay motivated together. Perfect for couples or workout partners.',
      duration: '60 minutes per session',
    },
    {
      name: 'Senior Fitness',
      sessions: 6,
      price: '240.00',
      description:
        'Specialized training for adults 55+. Focus on mobility, balance, and strength maintenance.',
      duration: '45 minutes per session',
    },
  ],

  promotions: [
    {
      title: 'New Year, New You!',
      content:
        '🎉 Start 2024 strong! Get 50% off your first month when you sign up for any membership. Plus, receive a free fitness assessment and personalized workout plan. Limited time offer!',
      validUntil: new Date('2024-02-29'),
    },
    {
      title: 'Bring a Friend Special',
      content:
        "👫 Refer a friend and both of you get a free week added to your membership! There's no limit to how many friends you can refer. The more you share, the more you save!",
      validUntil: new Date('2024-12-31'),
    },
    {
      title: 'Student Summer Deal',
      content:
        '🎓 Students get an extra 25% off the already discounted student membership rate during summer months (June-August). Show your student ID to claim this offer!',
      validUntil: new Date('2024-08-31'),
    },
    {
      title: 'Personal Training Bonus',
      content:
        '💪 Book any 8+ session personal training package and get 2 bonus sessions absolutely free! Perfect time to invest in your fitness journey with professional guidance.',
      validUntil: new Date('2024-03-31'),
    },
  ],
};

async function seedDatabase() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_cbSYx6q3Mtwk@ep-holy-fire-a44g93lx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const db = drizzle(pool, { schema });

  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (optional - remove in production)
    console.log('🧹 Clearing existing data...');
    await db.delete(schema.promotions);
    await db.delete(schema.ptPackages);
    await db.delete(schema.timetable);
    await db.delete(schema.pricing);

    // Seed pricing
    console.log('💰 Seeding pricing data...');
    await db.insert(schema.pricing).values(seedData.pricing);
    console.log(`✅ Inserted ${seedData.pricing.length} pricing records`);

    // Seed timetable
    console.log('📅 Seeding timetable data...');
    await db.insert(schema.timetable).values(seedData.timetable);
    console.log(`✅ Inserted ${seedData.timetable.length} timetable records`);

    // Seed PT packages
    console.log('🏃 Seeding personal training packages...');
    await db.insert(schema.ptPackages).values(seedData.ptPackages);
    console.log(`✅ Inserted ${seedData.ptPackages.length} PT package records`);

    // Seed promotions
    console.log('🎉 Seeding promotions data...');
    await db.insert(schema.promotions).values(seedData.promotions);
    console.log(`✅ Inserted ${seedData.promotions.length} promotion records`);

    console.log('🎊 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✨ Seeding process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase, seedData };
