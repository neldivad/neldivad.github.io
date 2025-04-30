import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
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
        <div className='flex justify-center flex-w'>
          <Link className="button button--primary button--lg m-2" to="/blog">
            Read my work
          </Link>
          <Link className="button button--secondary button--lg m-2" to="https://gravatar.com/neldivad">
            Contact me
          </Link>
        </div>

      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description="Documentation for music production, software, vocal synthesis">
      <HomepageHeader />

      <main>
        <section
          style={{
            padding: "2rem 1rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
            <span style={{ color: "" }}>Partnered Apps</span>
          </h1>
          <img
            src="img/tsukene-long.svg"
            alt="Tsukene Logo"
            style={{ width: "120px", height: "auto", marginBottom: "0.5rem" }}
          />
        </section>

        <section
          style={{
            padding: "2rem 2rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
            Try <span style={{ color: "#6366f1" }}>Tsukene</span>
          </h2>
          <p style={{ fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto 2rem" }}>
            Make it fun to support your favorite creator. Join live rooms. Bid. Cheer. Own your moment. Be the winner of all fans.
          </p>
          <Link
            className="button button--primary button--lg"
            to="https://tsukene.vercel.app"
            target="_blank"
          >
            Visit Tsukene
          </Link>
        </section>
      </main>
    </Layout>
  );
}
