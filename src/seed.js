require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');

async function seedAdmin() {
    try {
        // Sync database
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { email: 'admin@lutaver.com' } });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('📧 Email: admin@lutaver.com');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: 'Administrador',
            email: 'admin@lutaver.com',
            password_hash: 'admin123', // Will be hashed by the model hook
            role: 'admin',
            is_active: true
        });

        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: admin@lutaver.com');
        console.log('🔑 Password: admin123');
        console.log('');
        console.log('⚠️  IMPORTANT: Change this password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
}

seedAdmin();
