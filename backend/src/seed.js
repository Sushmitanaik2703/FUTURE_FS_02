require('dotenv').config();
const bcrypt = require('bcryptjs');
const { dbAsync, initDatabase } = require('./config/database');

const seedData = async () => {
  try {
    await initDatabase();

    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await dbAsync.run(`DELETE FROM lead_activities`);
    await dbAsync.run(`DELETE FROM leads`);
    await dbAsync.run(`DELETE FROM users`);

    // Create Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@crm.com').toLowerCase().trim();
    const rawPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const userResult = await dbAsync.run(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')`,
      ['Agency Admin', adminEmail, hashedPassword]
    );

    console.log(`✅ Default Admin user created: ${adminEmail}`);

    // Sample Leads Data
    const sampleLeads = [
      {
        name: 'Rahul Sharma',
        email: 'rahul@abctech.io',
        phone: '+91 98765 43210',
        company: 'ABC Technologies',
        source: 'Website Form',
        status: 'CONVERTED',
        message: 'Looking for a complete web application redesign and CRM integration for our sales team.',
        activities: [
          { type: 'CREATED', desc: 'Lead submitted via Website Contact Form: "Looking for a complete web application redesign..."', by: 'Website Visitor', offsetDays: 10 },
          { type: 'STATUS_CHANGE', desc: 'Status updated: NEW → CONTACTED', by: 'Agency Admin', offsetDays: 9 },
          { type: 'NOTE_ADDED', desc: 'Scheduled introductory discovery call for Tuesday at 3 PM.', by: 'Agency Admin', offsetDays: 8 },
          { type: 'STATUS_CHANGE', desc: 'Status updated: CONTACTED → IN_PROGRESS', by: 'Agency Admin', offsetDays: 6 },
          { type: 'NOTE_ADDED', desc: 'Sent formal proposal for $15,000 package.', by: 'Agency Admin', offsetDays: 4 },
          { type: 'STATUS_CHANGE', desc: 'Status updated: IN_PROGRESS → CONVERTED', by: 'Agency Admin', offsetDays: 1 }
        ]
      },
      {
        name: 'Priya Patel',
        email: 'priya@starlightdesign.co',
        phone: '+1 (555) 234-5678',
        company: 'Starlight Design Studio',
        source: 'Referral',
        status: 'IN_PROGRESS',
        message: 'Referred by Vikram. Need custom e-commerce solution with payment gateway integration.',
        activities: [
          { type: 'CREATED', desc: 'Lead manually entered from referral', by: 'Agency Admin', offsetDays: 7 },
          { type: 'STATUS_CHANGE', desc: 'Status updated: NEW → CONTACTED', by: 'Agency Admin', offsetDays: 6 },
          { type: 'NOTE_ADDED', desc: 'Had product demo call. Sent scope document.', by: 'Agency Admin', offsetDays: 3 },
          { type: 'STATUS_CHANGE', desc: 'Status updated: CONTACTED → IN_PROGRESS', by: 'Agency Admin', offsetDays: 2 }
        ]
      },
      {
        name: 'David Miller',
        email: 'david@apexglobal.com',
        phone: '+1 (555) 876-5432',
        company: 'Apex Global Logistics',
        source: 'LinkedIn',
        status: 'CONTACTED',
        message: 'Inquiring about client portal development and mobile responsive dashboard.',
        activities: [
          { type: 'CREATED', desc: 'Lead submitted via LinkedIn campaign', by: 'LinkedIn Integration', offsetDays: 4 },
          { type: 'STATUS_CHANGE', desc: 'Status updated: NEW → CONTACTED', by: 'Agency Admin', offsetDays: 3 },
          { type: 'NOTE_ADDED', desc: 'Left voicemail and sent follow-up email with case studies.', by: 'Agency Admin', offsetDays: 2 }
        ]
      },
      {
        name: 'Ananya Roy',
        email: 'ananya@nexusmedia.in',
        phone: '+91 91234 56789',
        company: 'Nexus Digital Media',
        source: 'Website Form',
        status: 'NEW',
        message: 'Hi! We need a landing page optimized for lead generation within 2 weeks.',
        activities: [
          { type: 'CREATED', desc: 'Lead submitted via Website Contact Form', by: 'Website Visitor', offsetDays: 0 }
        ]
      },
      {
        name: 'Carlos Mendez',
        email: 'carlos@cloudflow.app',
        phone: '+34 612 345 678',
        company: 'CloudFlow Solutions',
        source: 'Direct',
        status: 'LOST',
        message: 'Looking for offshore development team for SaaS MVP build.',
        activities: [
          { type: 'CREATED', desc: 'Lead submitted via Direct Inquiry', by: 'System', offsetDays: 14 },
          { type: 'STATUS_CHANGE', desc: 'Status updated: NEW → CONTACTED', by: 'Agency Admin', offsetDays: 12 },
          { type: 'NOTE_ADDED', desc: 'Client decided to build in-house due to budget constraints.', by: 'Agency Admin', offsetDays: 5 },
          { type: 'STATUS_CHANGE', desc: 'Status updated: CONTACTED → LOST', by: 'Agency Admin', offsetDays: 5 }
        ]
      },
      {
        name: 'Sophia Chen',
        email: 'sophia@vanguardfintech.io',
        phone: '+1 (555) 998-1122',
        company: 'Vanguard FinTech',
        source: 'Website Form',
        status: 'CONVERTED',
        message: 'We require a high-security customer dashboard and API integration.',
        activities: [
          { type: 'CREATED', desc: 'Lead submitted via Website Contact Form', by: 'Website Visitor', offsetDays: 18 },
          { type: 'STATUS_CHANGE', desc: 'Status updated: NEW → CONTACTED', by: 'Agency Admin', offsetDays: 16 },
          { type: 'STATUS_CHANGE', desc: 'Status updated: CONTACTED → IN_PROGRESS', by: 'Agency Admin', offsetDays: 12 },
          { type: 'STATUS_CHANGE', desc: 'Status updated: IN_PROGRESS → CONVERTED', by: 'Agency Admin', offsetDays: 7 }
        ]
      }
    ];

    const now = new Date();

    for (const item of sampleLeads) {
      const result = await dbAsync.run(
        `INSERT INTO leads (name, email, phone, company, source, status, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-${item.activities[0].offsetDays} days'))`,
        [item.name, item.email, item.phone, item.company, item.source, item.status, item.message]
      );

      const leadId = result.lastID;

      for (const act of item.activities) {
        await dbAsync.run(
          `INSERT INTO lead_activities (lead_id, activity_type, description, created_by, created_at)
           VALUES (?, ?, ?, ?, datetime('now', '-${act.offsetDays} days'))`,
          [leadId, act.type, act.desc, act.by]
        );
      }
    }

    console.log(`✅ ${sampleLeads.length} sample leads seeded with complete activity timelines.`);
    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
