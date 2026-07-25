import 'dotenv/config';
import { MongoClient } from 'mongodb';
import * as bcrypt from 'bcrypt';

async function seedDemoData() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('careOcare');

  await db.collection('users').deleteMany({ email: { $in: ['individual@demo.com', 'caregiver@demo.com'] } });
  await db.collection('messages').deleteMany({});
  await db.collection('risk_patterns').deleteMany({});
  await db.collection('ai_training_log').deleteMany({});
  await db.collection('caregiver_alerts').deleteMany({});

  const individualResult = await db.collection('users').insertOne({
    email: 'individual@demo.com',
    password: await bcrypt.hash('password123', 10),
    role: 'individual',
    createdAt: new Date(),
    updatedAt: new Date(),
    triggers: ['Boredom', 'Social isolation', 'Stress'],
    copingStrategies: ['gym', 'call friend', 'meditation', 'structured activity'],
    supportNetwork: ['caregiver@demo.com'],
    aiTrainingDay: 30,
    privacyAccepted: true,
    privacyAcceptedAt: new Date(),
    supportingUsers: [],
  });
  const individualId = individualResult.insertedId;

  const caregiverResult = await db.collection('users').insertOne({
    email: 'caregiver@demo.com',
    password: await bcrypt.hash('password123', 10),
    role: 'caregiver',
    createdAt: new Date(),
    updatedAt: new Date(),
    triggers: [],
    copingStrategies: [],
    supportNetwork: [],
    aiTrainingDay: 1,
    privacyAccepted: true,
    privacyAcceptedAt: new Date(),
    supportingUsers: [individualId],
  });

  const sampleContents = ['Feeling bored tonight', 'Struggling a bit today', 'Doing well, went for a walk', 'Feeling isolated'];
  const messages: any[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const isFriday = dayOfWeek === 'Friday';
    const hour = isFriday ? 20 + Math.floor(Math.random() * 3) : Math.floor(Math.random() * 24);
    date.setHours(hour, 0, 0, 0);

    const riskLevel = isFriday ? 'high' : Math.random() > 0.6 ? 'medium' : 'low';

    messages.push({
      userId: individualId,
      content: sampleContents[Math.floor(Math.random() * sampleContents.length)],
      timestamp: date,
      emotional_state: riskLevel === 'high' ? 'high' : riskLevel === 'medium' ? 'medium' : 'low',
      triggers_detected: riskLevel === 'high' ? ['Social isolation', 'Boredom'] : [],
      day_of_week: dayOfWeek,
      hour_of_day: hour,
      generated_script: null,
      script_generated_at: null,
    });
  }
  await db.collection('messages').insertMany(messages);

  await db.collection('risk_patterns').insertOne({
    userId: individualId,
    day_of_week: 'Friday',
    hour_range: '20-22',
    risk_level: 'high',
    reason: 'You mention isolation in 4 of your last 5 Friday check-ins, concentrated in this window.',
    frequency: 4,
    recommended_strategies: ['Structured activity 7-8pm (this worked twice before)', 'Text a friend before 7pm to lock in plans', 'Gym class or walk — physical activity broke the pattern last month'],
    updated_at: new Date(),
  });
  await db.collection('risk_patterns').insertOne({
    userId: individualId,
    day_of_week: 'Thursday',
    hour_range: '18-22',
    risk_level: 'medium',
    reason: 'A smaller pre-Friday dip — anticipation of the weekend tends to start here.',
    frequency: 2,
    recommended_strategies: ['Plan tomorrow evening tonight', 'Check in with your support contact'],
    updated_at: new Date(),
  });
  await db.collection('risk_patterns').insertOne({
    userId: individualId,
    day_of_week: 'Saturday',
    hour_range: '18-22',
    risk_level: 'medium',
    reason: 'Moderate risk — usually eases once Friday has passed.',
    frequency: 2,
    recommended_strategies: ["Keep momentum from Friday's coping plan", 'Light social contact if available'],
    updated_at: new Date(),
  });

  await db.collection('ai_training_log').insertOne({
    userId: individualId,
    day_number: 30,
    messages_analyzed: 30,
    patterns_detected: 3,
    personalization_score: 85,
    date: new Date(),
  });

  console.log('Seeded demo data:');
  console.log('  individual@demo.com / password123 ->', individualId.toString());
  console.log('  caregiver@demo.com / password123   ->', caregiverResult.insertedId.toString());

  await client.close();
  process.exit(0);
}

seedDemoData().catch((err) => {
  console.error(err);
  process.exit(1);
});
