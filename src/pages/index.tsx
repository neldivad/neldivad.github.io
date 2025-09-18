import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header 
      className="" 
      style={{
        padding: '4rem 0', 
        textAlign: 'center', 
        position: 'relative', 
        overflow: 'hidden'}
      }>
      <div className="container">
        <img
          src="/img/Nel2_neutralspeak.ico"
          alt="Logo"
          style={{
            width: '96px',
            height: '96px',
            marginBottom: '1rem',
          }}
        />
        <div
          style={{
            display: `flex`,
            flexDirection: `column`,
            placeItems: `center`,
          }}
        >
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
        </div>
      </div>
    </header>
  );
}


function MainContent() {
  return (
    <main>
      {/* SEO-Optimized Content Sections */}
      <section style={{ padding: "2rem 1rem" }}>
        <div className="container">
          <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Featured Content</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
            <div style={{ padding: "1rem", border: "1px solid var(--ifm-color-emphasis-300)", borderRadius: "8px" }}>
              <h4>Probability Calculators</h4>
              <p>Interactive tools for gacha analysis, Kelly Criterion, and A/B testing.</p>
              <Link className="button button--warning" to="/labs/category/probability">Explore Tools</Link>
            </div>
            <div style={{ padding: "1rem", border: "1px solid var(--ifm-color-emphasis-300)", borderRadius: "8px" }}>
              <h4>Business Analysis</h4>
              <p>MRR calculators and business insights for startups and entrepreneurs.</p>
              <Link className="button button--primary" to="/labs/business/mrr-movements">View Analysis</Link>
            </div>
            <div style={{ padding: "1rem", border: "1px solid var(--ifm-color-emphasis-300)", borderRadius: "8px" }}>
              <h4>Technical Writing</h4>
              <p>Programming tutorials, software development insights, and industry analysis.</p>
              <Link className="button button--info" to="/blog">Read Articles</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );

}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Nelverse - only nerd and weeb stuff here"
      description="David Len's personal website featuring software development insights, music production tutorials, and interactive tools. Explore coding projects, business analysis, and creative content.">

      {/* Hero */}
      <HomepageHeader />

      {/* Main Content */}
      <MainContent />
    </Layout>
  );
}
