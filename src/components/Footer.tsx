import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-column">
          <h3>Trace.</h3>
          <p>A private behavioral system.</p>
          <p className="footer-muted">Built for observing patterns over time.</p>
        </div>
        <div className="footer-column">
          <h3>Writing</h3>
          <ul>
            <li>
              <Link to="/writing/why-trace-exists">Why Trace exists</Link>
            </li>
            <li>
              <Link to="/writing/why-motivation-fails">Why motivation fails</Link>
            </li>
            <li>
              <Link to="/writing/avoidance-and-stakes">On avoidance and stakes</Link>
            </li>
            <li>
              <Link to="/writing/behavior-follows-identity">Behavior follows identity</Link>
            </li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>System</h3>
          <ul>
            <li>
              <Link to="/why">Why use Trace</Link>
            </li>
            <li>
              <Link to="/expect">What to expect</Link>
            </li>
            <li>
              <Link to="/definition">Definitions</Link>
            </li>
            <li>
              <Link to="/quiet-promise">The quiet promise</Link>
            </li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Feedback</h3>
          <ul>
            <li>
              <Link to="/feedback">Send feedback</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-microcopy">
        Trace produces self-evidence.
      </div>
    </footer>
  );
}

export default Footer;
