import { Layout } from '../components/Layout'
import { GlobeIcon } from '../components/icons'
import { useLanguage } from '../context/LanguageContext'

export function ImprintPage() {
  const { language, toggleLanguage, t } = useLanguage()

  return (
    <Layout
      title="Legal Notice | OD COMPLAINTS"
      description="Legal notice for OD COMPLAINTS, GD."
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
        <h1 className="mt-3 text-3xl font-medium uppercase tracking-widest text-neutral-100">{t.imprint.title}</h1>
        <div className="mt-8 space-y-7 text-sm leading-7 text-neutral-400">
          {t.imprint.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xs uppercase tracking-widest text-neutral-200">{section.heading}</h2>
              <p className="mt-2" dangerouslySetInnerHTML={{ __html: section.body }} />
            </section>
          ))}
          <p>{t.imprint.closing}</p>
        </div>
      </article>

      <article className="mt-14 max-w-2xl text-left">
        <h2 className="text-2xl font-medium uppercase tracking-widest text-neutral-100">{t.withdrawal.title}</h2>
        <div className="mt-6 space-y-7 text-sm leading-7 text-neutral-400">
          {t.withdrawal.sections.map((section) => (
            <section key={section.heading}>
              <h3 className="text-xs uppercase tracking-widest text-neutral-200">{section.heading}</h3>
              <p className="mt-2" dangerouslySetInnerHTML={{ __html: section.body }} />
            </section>
          ))}
        </div>
      </article>
    </Layout>
  )
}