import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SEED_USERS = [
  { email: "layla@example.com", name: "Layla Hassan", password: "password123", phone: "+447700900001", profession: "Software Engineer", city: "London", country: "UK", bio: "Full-stack dev passionate about connecting the Iraqi diaspora through technology. Built several community platforms.", diasporaStatus: "first_gen" },
  { email: "omar@example.com", name: "Omar Al-Jamil", password: "password123", phone: "+971500000002", profession: "Architect", city: "Dubai", country: "UAE", bio: "Award-winning architect specializing in sustainable design. Proud Iraqi based in the Gulf.", diasporaStatus: "first_gen" },
  { email: "zahra@example.com", name: "Zahra Al-Khalidi", password: "password123", phone: "+16170000003", profession: "Doctor", city: "Dearborn", country: "USA", bio: "Physician at Henry Ford Hospital. Community organizer for Iraqi health awareness programs.", diasporaStatus: "first_gen" },
  { email: "ali@example.com", name: "Ali Mansour", password: "password123", phone: "+490000000004", profession: "PhD Researcher", city: "Berlin", country: "Germany", bio: "Researching AI for medical imaging at TU Berlin. Iraqi-German bridging tech and healthcare.", diasporaStatus: "first_gen" },
  { email: "noor@example.com", name: "Noor Al-Saadi", password: "password123", phone: "+440000000005", profession: "Restaurant Owner", city: "Manchester", country: "UK", bio: "Owner of Baghdad Bites in Manchester. Bringing authentic Iraqi cuisine to the UK.", diasporaStatus: "first_gen" },
];

const SEED_POSTS = [
  { authorEmail: "layla@example.com", content: "Just launched a new feature for Iraqee — the community feed! Would love feedback from everyone. What features do you want to see next?" },
  { authorEmail: "layla@example.com", content: "Anyone else attending the Iraqi Tech Network event in London next week? Would be great to meet fellow devs." },
  { authorEmail: "omar@example.com", content: "Just finished a project designing a community center for the Iraqi community in Dubai. So proud to serve our diaspora with spaces that feel like home." },
  { authorEmail: "omar@example.com", content: "Looking for Iraqi architects in Europe to collaborate on a cultural exhibition project. DM me if interested!" },
  { authorEmail: "zahra@example.com", content: "Important health announcement: Free blood pressure screening at the Iraqi Community Center in Dearborn this Saturday. Spread the word!" },
  { authorEmail: "zahra@example.com", content: "Being an Iraqi doctor in America means bridging two worlds. So grateful for the trust our community places in me." },
  { authorEmail: "ali@example.com", content: "My latest paper on AI-assisted diagnosis was accepted! 🇮🇶 Proud to represent Iraq in the international research community." },
  { authorEmail: "ali@example.com", content: "Berlin is getting cold! Anyone know where I can find good Iraqi bread (samoon) here? Missing home flavours." },
  { authorEmail: "noor@example.com", content: "Ramadan special menu is ready! We're doing iftar parties every weekend at Baghdad Bites in Manchester. Limited seats — book now!" },
  { authorEmail: "noor@example.com", content: "10 years ago I moved to Manchester with nothing but my grandmother's recipes. Today we opened our second Baghdad Bites location. Never give up on your dreams." },
];

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clean existing seed data
  await prisma.notification.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversationParticipant.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.follow.deleteMany({});
  await prisma.postComment.deleteMany({});
  await prisma.postLike.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.listing.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  // Create users + profiles
  const createdUsers: Record<string, any> = {};
  for (const u of SEED_USERS) {
    const hashedPassword = await bcrypt.hash(u.password, 12);
    const user = await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        hashedPassword,
        profile: {
          create: {
            displayName: u.name,
            bio: u.bio,
            profession: u.profession,
            city: u.city,
            country: u.country,
            languages: ["English", "Arabic"],
            diasporaStatus: u.diasporaStatus,
            phone: u.phone,
          },
        },
      },
    });
    createdUsers[u.email] = user;
    console.log(`  ✓ ${u.name} created`);
  }

  // Create posts
  const createdPosts: any[] = [];
  for (const p of SEED_POSTS) {
    const user = createdUsers[p.authorEmail];
    const post = await prisma.post.create({
      data: { authorId: user.id, content: p.content },
    });
    createdPosts.push(post);
  }
  console.log(`  ✓ ${createdPosts.length} posts created`);

  // Follows: everyone follows Layla, Layla follows everyone
  const layla = createdUsers["layla@example.com"];
  for (const [email, user] of Object.entries(createdUsers)) {
    if (email !== "layla@example.com") {
      await prisma.follow.create({
        data: { followerId: user.id, followingId: layla.id },
      });
      await prisma.follow.create({
        data: { followerId: layla.id, followingId: user.id },
      });
    }
  }
  // Also some cross-follows
  await prisma.follow.create({ data: { followerId: createdUsers["omar@example.com"].id, followingId: createdUsers["zahra@example.com"].id } });
  await prisma.follow.create({ data: { followerId: createdUsers["zahra@example.com"].id, followingId: createdUsers["ali@example.com"].id } });
  await prisma.follow.create({ data: { followerId: createdUsers["noor@example.com"].id, followingId: createdUsers["omar@example.com"].id } });
  console.log("  ✓ Follows created");

  // Likes on some posts
  const postAuthors = [
    { postIdx: 0, likers: ["omar@example.com", "zahra@example.com", "ali@example.com", "noor@example.com"] },
    { postIdx: 1, likers: ["omar@example.com", "zahra@example.com"] },
    { postIdx: 2, likers: ["layla@example.com", "zahra@example.com", "noor@example.com"] },
    { postIdx: 3, likers: ["layla@example.com", "ali@example.com"] },
    { postIdx: 4, likers: ["layla@example.com", "omar@example.com", "ali@example.com", "noor@example.com"] },
    { postIdx: 6, likers: ["layla@example.com", "omar@example.com", "zahra@example.com", "noor@example.com"] },
    { postIdx: 9, likers: ["layla@example.com", "omar@example.com", "zahra@example.com", "ali@example.com"] },
  ];
  for (const { postIdx, likers } of postAuthors) {
    for (const email of likers) {
      try {
        await prisma.postLike.create({
          data: { postId: createdPosts[postIdx].id, userId: createdUsers[email].id },
        });
      } catch {}
    }
  }
  console.log("  ✓ Likes created");

  // Comments
  const comments = [
    { postIdx: 0, author: "omar@example.com", content: "Love this! A feed makes it feel like an actual community. How about groups next?" },
    { postIdx: 0, author: "zahra@example.com", content: "Great work Layla! Would love a way to share health tips and announcements." },
    { postIdx: 4, author: "layla@example.com", content: "I'll be there! Bringing the whole family." },
    { postIdx: 6, author: "zahra@example.com", content: "Mabrook Ali! So proud to see Iraqis leading in research!" },
    { postIdx: 7, author: "noor@example.com", content: "Ali! I know a place in Neukölln that makes fresh samoon. I'll DM you the address." },
    { postIdx: 9, author: "layla@example.com", content: "This made my day. Your grandmother would be so proud Noor ❤️" },
    { postIdx: 9, author: "omar@example.com", content: "Incredible story! Will definitely visit next time I'm in Manchester." },
  ];
  for (const c of comments) {
    await prisma.postComment.create({
      data: {
        postId: createdPosts[c.postIdx].id,
        authorId: createdUsers[c.author].id,
        content: c.content,
      },
    });
  }
  console.log("  ✓ Comments created");

  // A conversation
  const noor = createdUsers["noor@example.com"];
  const ali = createdUsers["ali@example.com"];
  const conv = await prisma.conversation.create({
    data: {
      participants: { create: [{ userId: noor.id }, { userId: ali.id }] },
      messages: {
        create: [
          { senderId: ali.id, content: "Hey Noor! I saw your post about Baghdad Bites. I'm coming to Manchester next month, would love to visit!" },
          { senderId: noor.id, content: "Ali! Yes please! I'll save you a table. What dates are you thinking?" },
        ],
      },
    },
  });
  console.log("  ✓ Sample conversation created");

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());