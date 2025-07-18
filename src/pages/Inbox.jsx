import Inbox from '../components/Inbox';

export default function InboxPage({ currentUser }) {
  return (
    <div>
      <h2>Your Messages</h2>
      <Inbox userId={currentUser.id} />
    </div>
  );
} 