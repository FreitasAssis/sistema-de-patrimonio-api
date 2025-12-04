#!/bin/bash

# Database Setup Script for Render Deployment
# This script runs migrations and seeds the database
# Run this ONCE after first deployment

echo "🚀 Starting database setup..."
echo ""

# Run migrations
echo "📊 Running database migrations..."
yarn db:migrate

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
else
    echo "❌ Migration failed!"
    exit 1
fi

echo ""

# Run seeds
echo "🌱 Seeding database with initial data..."
yarn db:seed

if [ $? -eq 0 ]; then
    echo "✅ Database seeded successfully"
    echo ""
    echo "📝 Default admin credentials:"
    echo "   Email: admin@email.com"
    echo "   Password: admin123"
    echo ""
    echo "⚠️  IMPORTANT: Change the admin password after first login!"
else
    echo "❌ Seeding failed!"
    exit 1
fi

echo ""
echo "🎉 Database setup complete!"
