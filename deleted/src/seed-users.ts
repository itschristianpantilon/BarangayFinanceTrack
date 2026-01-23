import { storage } from "./storage";
import { hashPassword } from "../auth";
import type { InsertUser } from "../../shared/schema";

async function seedUsers() {
  console.log("🌱 Seeding initial users...");

  const defaultUsers: Omit<InsertUser, 'password'> & { password: string }[] = [
    {
      username: "superadmin",
      password: "admin123",
      role: "superadmin",
      fullName: "System Administrator",
      position: "Super Admin",
      isActive: "true",
    },
    {
      username: "kapitan",
      password: "kapitan123",
      role: "admin",
      fullName: "Barangay Captain",
      position: "Kapitan",
      isActive: "true",
    },
    {
      username: "secretary",
      password: "secretary123",
      role: "admin",
      fullName: "Barangay Secretary",
      position: "Secretary",
      isActive: "true",
    },
    {
      username: "treasurer",
      password: "treasurer123",
      role: "encoder",
      fullName: "Barangay Treasurer",
      position: "Treasurer",
      isActive: "true",
    },
    {
      username: "bookkeeper",
      password: "bookkeeper123",
      role: "checker",
      fullName: "Barangay Bookkeeper",
      position: "Bookkeeper",
      isActive: "true",
    },
    {
      username: "council1",
      password: "council123",
      role: "reviewer",
      fullName: "Barangay Councilor 1",
      position: "Barangay Council",
      isActive: "true",
    },
    {
      username: "approver",
      password: "approver123",
      role: "approver",
      fullName: "Budget Approver",
      position: "Kapitan",
      isActive: "true",
    },
  ];

  for (const userData of defaultUsers) {
    try {
      // Check if user already exists
      const existing = await storage.getUserByUsername(userData.username);
      
      if (existing) {
        console.log(`⏭️  User '${userData.username}' already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user
      await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      console.log(`✅ Created user: ${userData.username} (${userData.role} - ${userData.position})`);
    } catch (error) {
      console.error(`❌ Failed to create user '${userData.username}':`, error);
    }
  }

  console.log("\n🎉 Seeding complete!");
  console.log("\n📝 Default credentials:");
  console.log("   superadmin / admin123");
  console.log("   kapitan / kapitan123");
  console.log("   secretary / secretary123");
  console.log("   treasurer / treasurer123");
  console.log("   bookkeeper / bookkeeper123");
  console.log("   council1 / council123");
  console.log("   approver / approver123");
}

export { seedUsers };

// Run seed
seedUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
