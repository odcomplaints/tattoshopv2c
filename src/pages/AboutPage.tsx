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
    </Layout>
  )
}