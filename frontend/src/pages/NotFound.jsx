import { Link } from 'react-router-dom';
import useTitle from '../hooks/useTitle.js';

export default function NotFound() {
  useTitle('Page not found | Menal');
  return (
    <main className="container pp-missing">
      <h1 className="display">404</h1>
      <p className="muted">That page does not exist.</p>
      <Link className="btn primary" to="/">Back home</Link>
    </main>
  );
}
