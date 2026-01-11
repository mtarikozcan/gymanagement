import { PrismaClient, BusinessModel, BillingPeriod, MemberStatus, MembershipStatus, InvoiceStatus, AttendanceStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Demo data configuration
const DEMO_CONFIG = {
    members: 24,
    trainers: 4,
    classesPerWeek: 12,
    overdueInvoices: 5,
};

// Helper to generate random dates
function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Random picker
function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Member names
const FIRST_NAMES = ['Ali', 'Ayşe', 'Mehmet', 'Fatma', 'Ahmet', 'Zeynep', 'Mustafa', 'Elif', 'Emre', 'Selin', 'Can', 'Deniz', 'Burak', 'Ece', 'Oğuz', 'Merve', 'Kerem', 'Sude', 'Arda', 'Yağmur', 'Doruk', 'Nehir', 'Efe', 'Damla'];
const LAST_NAMES = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek', 'Polat'];

// Trainer specialties
const SPECIALTIES = ['Fitness', 'Yoga', 'Pilates', 'CrossFit', 'Boxing', 'Spinning', 'Personal Training', 'Group Classes'];

// Class titles
const CLASS_TITLES = ['Morning Yoga', 'HIIT Blast', 'Core Power', 'Spin Class', 'Body Pump', 'Zumba', 'Pilates Flow', 'Boxing Basics', 'Strength Training', 'Stretch & Flex', 'CrossFit WOD', 'Dance Fitness'];

async function seedDemoGym(gymId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    // Create Plans
    const plans = await Promise.all([
        prisma.plan.create({
            data: {
                gymId,
                name: 'Monthly Membership',
                billingPeriod: 'monthly',
                priceCents: 90000, // 900 TRY
                currency: 'TRY',
                durationDays: 30,
                isDemo: true,
            },
        }),
        prisma.plan.create({
            data: {
                gymId,
                name: '3-Month Plan',
                billingPeriod: 'monthly',
                priceCents: 240000, // 2400 TRY
                currency: 'TRY',
                durationDays: 90,
                isDemo: true,
            },
        }),
        prisma.plan.create({
            data: {
                gymId,
                name: '10 PT Sessions',
                billingPeriod: 'session_pack',
                priceCents: 500000, // 5000 TRY
                currency: 'TRY',
                durationDays: 60,
                isDemo: true,
            },
        }),
    ]);

    // Create Trainers
    const trainers = await Promise.all(
        Array.from({ length: DEMO_CONFIG.trainers }, (_, i) =>
            prisma.trainer.create({
                data: {
                    gymId,
                    fullName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
                    phone: `+90 5${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
                    email: `trainer${i + 1}@pulsegym.demo`,
                    specialty: pick(SPECIALTIES),
                    isDemo: true,
                },
            })
        )
    );

    // Create Members with Memberships and Invoices
    const memberStatuses: MemberStatus[] = ['active', 'active', 'active', 'active', 'frozen', 'expired'];

    for (let i = 0; i < DEMO_CONFIG.members; i++) {
        const memberStatus = pick(memberStatuses);
        const plan = pick(plans);
        const startDate = randomDate(threeMonthsAgo, now);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + plan.durationDays);

        const membershipStatus: MembershipStatus =
            memberStatus === 'frozen' ? 'frozen' :
                endDate < now ? 'expired' : 'active';

        const member = await prisma.member.create({
            data: {
                gymId,
                fullName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
                phone: `+90 5${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
                email: i % 3 === 0 ? `member${i + 1}@example.com` : null,
                status: memberStatus,
                isDemo: true,
            },
        });

        const membership = await prisma.membership.create({
            data: {
                gymId,
                memberId: member.id,
                planId: plan.id,
                startDate,
                endDate,
                status: membershipStatus,
                nextDueDate: endDate,
                isDemo: true,
            },
        });

        // Create invoice
        const isOverdue = i < DEMO_CONFIG.overdueInvoices;
        const dueDate = isOverdue
            ? randomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now)
            : startDate;

        const invoiceStatus: InvoiceStatus = isOverdue ? 'due' : (Math.random() > 0.3 ? 'paid' : 'due');

        await prisma.invoice.create({
            data: {
                gymId,
                memberId: member.id,
                membershipId: membership.id,
                amountCents: plan.priceCents,
                currency: 'TRY',
                dueDate,
                status: invoiceStatus,
                isDemo: true,
            },
        });
    }

    // Create Classes for this week
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const classHours = [9, 10, 11, 14, 17, 18, 19, 20];

    for (let i = 0; i < DEMO_CONFIG.classesPerWeek; i++) {
        const dayOffset = Math.floor(i / 2);
        const classDate = new Date(weekStart);
        classDate.setDate(classDate.getDate() + dayOffset);

        const hour = pick(classHours);
        const startTime = new Date(classDate);
        startTime.setHours(hour, 0, 0, 0);

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + (Math.random() > 0.5 ? 60 : 45));

        const gymClass = await prisma.class.create({
            data: {
                gymId,
                title: pick(CLASS_TITLES),
                trainerId: pick(trainers).id,
                startTime,
                endTime,
                capacity: pick([10, 12, 15, 20, null]),
                isDemo: true,
            },
        });

        // Add some attendance
        const attendeeCount = Math.floor(Math.random() * 8) + 2;
        const members = await prisma.member.findMany({
            where: { gymId, isDemo: true },
            take: attendeeCount,
        });

        for (const member of members) {
            const status: AttendanceStatus = classDate < now
                ? pick(['attended', 'attended', 'attended', 'no_show'])
                : 'registered';

            await prisma.classAttendance.create({
                data: {
                    gymId,
                    classId: gymClass.id,
                    memberId: member.id,
                    status,
                },
            });
        }
    }

    console.log(`✅ Seeded demo data for gym ${gymId}`);
    console.log(`   - ${plans.length} plans`);
    console.log(`   - ${trainers.length} trainers`);
    console.log(`   - ${DEMO_CONFIG.members} members`);
    console.log(`   - ${DEMO_CONFIG.classesPerWeek} classes`);
}

async function main() {
    console.log('🌱 Starting PulseGym seed...\n');

    // Create demo user if not exists
    const demoEmail = 'demo@pulsegym.app';
    let user = await prisma.user.findUnique({ where: { email: demoEmail } });

    if (!user) {
        const passwordHash = await bcrypt.hash('Demo123!', 12);
        user = await prisma.user.create({
            data: {
                email: demoEmail,
                name: 'Demo User',
                passwordHash,
            },
        });
        console.log('✅ Created demo user: demo@pulsegym.app / Demo123!');
    }

    // Create demo gym
    let gym = await prisma.gym.findFirst({
        where: { name: 'FitPulse Studio', isDemo: true },
    });

    if (!gym) {
        gym = await prisma.gym.create({
            data: {
                name: 'FitPulse Studio',
                city: 'İstanbul',
                businessModel: 'monthly',
                isDemo: true,
            },
        });
        console.log('✅ Created demo gym: FitPulse Studio');

        // Make user owner
        await prisma.gymUser.create({
            data: {
                gymId: gym.id,
                userId: user.id,
                role: 'owner',
                status: 'active',
            },
        });

        // Seed demo data
        await seedDemoGym(gym.id);
    } else {
        console.log('ℹ️  Demo gym already exists');
    }

    console.log('\n🎉 Seed complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
