export default function Feedback({ message, type = 'danger' }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`} role={type === 'danger' ? 'alert' : 'status'}>
      {message}
    </div>
  );
}
