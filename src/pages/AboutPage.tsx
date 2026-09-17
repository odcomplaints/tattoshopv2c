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
        <p className="text-xs uppercase tracking-widest text-neutral-300">Identity Core</p>
        <h2 className="mt-2 text-2xl font-medium uppercase tracking-widest text-neutral-100">
          Consumed by desire. Unmoved by reality.
        </h2>
        <div className="mt-5 space-y-5 text-sm leading-7 text-neutral-400">
          <p>OD Complaints is a visual and physical projection of extreme desire — a sanctuary for anyone so consumed by an idea, a goal, a passion or a person that the line between longing and reality begins to blur.</p>
          <p>We take the raw psychology of obsession and turn it into wearable apparel, visual art and permanent marks.</p>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <div>
            <span className="text-xs uppercase tracking-widest text-accent">Obsessed</span>
            <h3 className="mt-3 text-sm font-medium uppercase tracking-widest text-neutral-100">The possession. The inward pull.</h3>
            <p className="mt-4 text-sm leading-7 text-neutral-400">Consuming fixation, visceral longing, devotion without an exit strategy. It's what you wake up thinking about and what lingers when the lights go out — you no longer just possess a passion, you are possessed by it.</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-accent">Delusional</span>
            <h3 className="mt-3 text-sm font-medium uppercase tracking-widest text-neutral-100">The denial of "no". The persistence of wanting.</h3>
            <p className="mt-4 text-sm leading-7 text-neutral-400">The mind's total refusal to accept the status quo: "I don't have it yet, but I refuse to comprehend a reality where I never will." To the outside world it looks like madness — to you, it's the only truth that matters.</p>
          </div>
        </div>

        <div className="mt-10">
          <p className="text-xs uppercase tracking-widest text-accent">Complaints</p>
          <p className="mt-4 text-sm leading-7 text-neutral-400">When someone is fully consumed by longing and refuses the limits of reality, the world responds with resistance — the side-eyes, the unsolicited advice, the friction of an adjusted, comfortable majority. "You're overthinking this." "It's not realistic." "Let it go."</p>
          <p className="mt-4 text-sm leading-7 text-neutral-400">We treat these objections as badges of honor. Every garment, print and custom tattoo is physical evidence — a shield of heavy fabric and sharp ink proving you feel no shame for your intensity.</p>
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