"""
CLI script to create the first admin user.
Usage: python -m app.create_admin
"""
import asyncio
from app.database import users_collection
from app.auth import hash_password


async def create_admin():
    email = input("Admin email: ").strip()
    password = input("Admin password: ").strip()
    name = input("Admin name (default: Admin): ").strip() or "Admin"

    if not email or not password:
        print("❌ Email and password are required")
        return

    existing = await users_collection.find_one({"email": email})
    if existing:
        print(f"⚠️ User with email {email} already exists")
        return

    await users_collection.insert_one({
        "name": name,
        "email": email,
        "password": hash_password(password),
        "role": "admin",
        "coding_skill": 0,
        "design_skill": 0,
        "leadership": 0,
        "communication": 0,
        "reliability": 0.0,
        "is_active": True,
    })
    print(f"✅ Admin user '{name}' ({email}) created successfully")


if __name__ == "__main__":
    asyncio.run(create_admin())
