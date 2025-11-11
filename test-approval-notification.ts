import 'dotenv/config';
import { postContentApprovalNotification } from './server/slack';

async function testApprovalNotification() {
  console.log('Testing Slack approval notification...');
  
  try {
    const result = await postContentApprovalNotification(
      'C09Q0RUN0Q0', // Mogul Media Slack channel
      'Mogul Media',
      '[Mogul Media] - Content Review',
      'https://docs.google.com/document/d/1GMi_8wzIW8I1LvV4UMis8R1BWGaCPevsdaLoSKQXyd0/edit?tab=t.906sykr7jji9'
    );
    
    console.log('✅ Success! Notification sent to Mogul Media Slack channel');
    console.log('Response:', result);
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
}

testApprovalNotification();
