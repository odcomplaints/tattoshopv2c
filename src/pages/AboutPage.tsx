import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { GlobeIcon } from '../components/icons'
import { useLanguage } from '../context/LanguageContext'

export function AboutPage() {
  const { language, toggleLanguage, t } = useLanguage()

  return (
    <Layout
      title="About | OD COMPLAINTS"
      description="About OD COMPLAINTS, tattoo artist for blackwork and fineline in GD."
      headerExtra={
        <button
          type="button"
          onClick={toggleLanguage}
          aria-label={language === 'en' ? 'Auf Deutsch umschalten' : 'Switch to English'}
          className="lang-toggle mr-[70px] flex h-9 w-9 items-center justify-center transition-colors sm:mr-[86px] lg:mr-[116px]"
        >
          <GlobeIcon />
        </button>
      }
    >
      <section className="max-w-2xl text-left">
        <p className="text-xs uppercase tracking-widest text-neutral-300">{t.about.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black uppercase tracking-widest text-neutral-100">{t.about.title}</h1>
        <div className="mt-8 space-y-5 text-sm leading-7 text-neutral-400">
          {t.about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="mt-16 max-w-3xl border-t border-neutral-800 pt-10 text-left sm:mt-24 sm:pt-14">
        <p className="text-xs uppercase tracking-widest text-neutral-300">Styles &amp; Moodboard</p>
        <h2 className="mt-2 text-2xl font-medium uppercase tracking-widest text-neutral-100">
          Mehr über meinen Stil
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-400">
          Ein gemeinsames Moodboard mit Designs, Flashes und Referenzen zu den Stilen, in denen ich am liebsten
          arbeite — von Neo Tribal über Cyber Sigilism bis Gothic.
        </p>

        <Link
          to="/styles"
          className="mt-8 inline-block text-xs uppercase tracking-widest text-neutral-300 hover:text-accent"
        >
          Zum Moodboard &rarr;
        </Link>
      </section>
    </Layout>
  )
}