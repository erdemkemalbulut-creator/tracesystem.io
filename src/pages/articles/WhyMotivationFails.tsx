import ArticleLayout from '../ArticleLayout';

function WhyMotivationFails() {
  return (
    <ArticleLayout title="Why Motivation Fails">
      <p>
        Motivation is unreliable. It depends on how you feel.
      </p>
      <p>
        Systems do not care how you feel.
      </p>
      <p>
        Motivation treats behavior as an event. Trace treats behavior as a process.
      </p>
      <p>
        You do not need inspiration to observe what you are doing.
        <br />
        You only need to be willing to look.
      </p>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '2rem' }}>
        If you're ready, you can <a href="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}>enter the system</a>.
      </p>
    </ArticleLayout>
  );
}

export default WhyMotivationFails;
