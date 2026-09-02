import { Layout } from '../components/Layout'
import { GlobeIcon } from '../components/icons'
import { useLanguage } from '../context/LanguageContext'

export function PrivacyPage() {
  const { language, toggleLanguage, t } = useLanguage()

  return (
    <Layout
      title="Privacy | OD COMPLAINTS"
      description="Privacy information for OD COMPLAINTS."
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
      <article className="max-w-2xl text-left">
        <p className="text-xs uppercase tracking-widest text-neutral-300">{t.legal.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-medium uppercase tracking-widest text-neutral-100">{t.privacy.title}</h1>
        <div className="mt-8 space-y-7 text-sm leading-7 text-neutral-400">
          {t.privacy.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xs uppercase tracking-widest text-neutral-200">{section.heading}</h2>
              <p className="mt-2">{section.body}</p>
            </section>
          ))}
          <p>{t.privacy.closing}</p>
        </div>
      </article>
    </Layout>
  )
}