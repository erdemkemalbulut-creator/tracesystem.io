import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface ArticleLayoutProps {
  title: string;
  children: ReactNode;
}

function ArticleLayout({ title, children }: ArticleLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="page-with-shell">
      <Header />
      <main className="article-content">
        <button onClick={() => navigate(-1)} className="back-link">
          Back
        </button>
        <article>
          <h1>{title}</h1>
          <div className="article-body">{children}</div>
        </article>
        <Link to="/feedback" className="article-footer-link">
          Send feedback
        </Link>
      </main>
      <Footer />
    </div>
  );
}

export default ArticleLayout;
