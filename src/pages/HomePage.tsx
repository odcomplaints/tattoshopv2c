import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import AccordionGallery from '../components/AccordionGallery'
import { GlobeIcon } from '../components/icons'
import SpecularButton from '../components/SpecularButton'
import { useLanguage } from '../context/LanguageContext'
import { sliderImages } from '../data/slider'

const accordionItems = sliderImages.map((item) => ({
  image: item.image,
  zoom: item.zoom,
  offsetY: item.offsetY,
  mono: item.mono,
  label: item.title,
  alt: `${item.title} – ${item.style}`,
}))

export function HomePage() {
  const { language, toggleLanguage, t } = useLanguage()
  const navigate = useNavigate()

  return (
    <Layout
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
      <section className="mx-auto flex min-h-[58svh] max-w-4xl flex-col items-center justify-center pb-5 text-center">
        <p className="text-xs uppercase tracking-widest text-accent">{t.home.eyebrow}</p>
        <h1 className="mt-5 w-full text-5xl font-black uppercase leading-[0.95] tracking-wide text-neutral-100 sm:text-7xl" style={{ color: '#ff3939' }}>
          OD COMPLAINTS
        </h1>
        <p className="mt-5 w-full max-w-md text-base uppercase tracking-[0.3em] text-accent sm:text-lg">
          {t.home.tagline}
        </p>
        <p className="mt-6 max-w-xl text-sm leading-7 text-neutral-400">{t.home.description}</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <SpecularButton
            size="lg"
            radius={0}
            tint="#ffffff"
            tintOpacity={0}
            blur={0}
            textColor="#f5f5f5"
            lineColor="#ffffff"
            baseColor="#525252"
            intensity={1}
            shineSize={10}
            shineFade={40}
            thickness={1}
            speed={0.35}
            followMouse
            proximity={250}
            autoAnimate={false}
            onClick={() => navigate('/booking')}
          >
            {t.home.bookSession}
          </SpecularButton>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <SpecularButton
            size="sm"
            radius={0}
            tint="#ffffff"
            tintOpacity={0}
            blur={0}
            textColor="#f5f5f5"
            lineColor="#ffffff"
            baseColor="#525252"
            intensity={1}
            shineSize={10}
            shineFade={40}
            thickness={1}
            speed={0.35}
            followMouse
            proximity={250}
            autoAnimate={false}
            onClick={() => navigate('/styles')}
          >
            {t.home.browseFlashes}
          </SpecularButton>
        </div>
      </section>
      <section className="pt-5 text-center sm:pt-8">
        <div className="mb-8 flex flex-col items-center justify-center gap-3">
          <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-100">Latest work</h2>
          <Link className="text-xs uppercase tracking-widest text-neutral-300 transition-colors hover:text-accent" to="/work">View all work</Link>
        </div>
        <div className="mx-auto max-w-5xl px-4">
          <AccordionGallery
            items={accordionItems}
            defaultIndex={Math.floor(accordionItems.length / 2)}
            accentColor="#ff3939"
            overlayColor="#060010"
            textColor="#ffffff"
            height={420}
            gap={10}
            radius={28}
            expandRatio={0.75}
            trigger="click"
            showLabels={false}
            grayscale
          />
        </div>
      </section>
      <section className="mt-5 py-5 text-center sm:mt-8 sm:py-8">
        <div className="mx-auto grid max-w-2xl gap-6">
          <div><p className="text-xs uppercase tracking-widest text-accent">{t.home.studio.eyebrow}</p><h2 className="mt-3 text-2xl font-medium uppercase tracking-widest text-neutral-100">{t.home.studio.title}</h2></div>
          <div className="space-y-5 text-sm leading-7 text-neutral-400">
            {t.home.studio.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <Link className="inline-block text-xs uppercase tracking-widest text-neutral-300 underline underline-offset-4 transition-colors hover:text-accent" to="/about">{t.home.studio.aboutLink}</Link>
          </div>
        </div>
      </section>
      <section className="py-5 text-center sm:py-8">
        <p className="text-xs uppercase tracking-widest text-accent">{t.home.process.eyebrow}</p>
        <h2 className="mt-3 text-2xl font-medium uppercase tracking-widest text-neutral-100">{t.home.process.title}</h2>
        <ol className="mt-10 grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
          {t.home.process.steps.map(({ title, description }, index) => {
            const number = String(index + 1).padStart(2, '0')
            return <li key={number} className="p-5 sm:p-6"><span className="text-xs text-accent">{number}</span><h3 className="mt-8 text-xs font-medium uppercase tracking-widest text-neutral-100">{title}</h3><p className="mt-3 text-sm leading-6 text-neutral-300">{description}</p></li>
          })}
        </ol>
      </section>
      <section className="py-5 text-center sm:py-8">
        <div className="mx-auto grid max-w-2xl gap-8">
          <div><p className="text-xs uppercase tracking-widest text-accent">{t.home.guide.eyebrow}</p><h2 className="mt-3 text-2xl font-medium uppercase tracking-widest text-neutral-100">{t.home.guide.title}</h2><p className="mx-auto mt-5 max-w-md text-sm leading-7 text-neutral-400">{t.home.guide.description}</p></div>
          <dl className="text-sm">
            {t.home.guide.prices.map(({ label, price }) => <div key={label} className="flex items-baseline justify-center gap-4 py-4"><dt className="text-neutral-200">{label}</dt><dd className="text-neutral-300">{price}</dd></div>)}
          </dl>
        </div>
      </section>
      <section className="py-5 text-center sm:py-8">
        <div className="mx-auto grid max-w-2xl gap-8">
          <div><p className="text-xs uppercase tracking-widest text-accent">{t.home.preparation.eyebrow}</p><h2 className="mt-3 text-2xl font-medium uppercase tracking-widest text-neutral-100">{t.home.preparation.title}</h2></div>
          <ul className="grid gap-4 text-sm leading-7 text-neutral-400 sm:grid-cols-2">
            {t.home.preparation.tips.map((item) => <li key={item} className="flex items-start justify-center gap-2 px-4 py-3"><span className="text-accent">+</span><span>{item}</span></li>)}
          </ul>
        </div>
      </section>
      <section className="py-5 text-center sm:py-8">
        <p className="text-xs uppercase tracking-widest text-accent">{t.home.faq.eyebrow}</p>
        <h2 className="mt-3 text-2xl font-medium uppercase tracking-widest text-neutral-100">{t.home.faq.title}</h2>
        <div className="mx-auto mt-8 max-w-2xl">
          {t.home.faq.items.map(({ question, answer, answerBeforeLink, linkText, answerAfterLink }) => (
            <details key={question} className="py-4">
              <summary className="cursor-pointer text-xs uppercase tracking-widest text-neutral-200 transition-all duration-200 hover:scale-110 hover:text-accent">
                {question}
              </summary>
              <p className="mt-3 text-sm leading-7 text-neutral-300">
                {linkText ? (
                  <>
                    {answerBeforeLink}
                    <Link to="/styles" className="text-accent underline underline-offset-4 transition-colors hover:text-neutral-100">
                      {linkText}
                    </Link>
                    {answerAfterLink}
                  </>
                ) : (
                  answer
                )}
              </p>
            </details>
          ))}
        </div>
      </section>
      <section className="pt-5 text-center sm:pt-8">
        <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10 sm:py-14">
          <p className="text-xs uppercase tracking-widest text-neutral-200">GD / Private Studio</p>
          <h2 className="mt-4 text-3xl font-medium uppercase leading-tight tracking-widest sm:text-4xl">Ready to start a project together?</h2>
          <div className="mt-8 flex justify-center">
            <SpecularButton
              size="lg"
              radius={0}
              tint="#ffffff"
              tintOpacity={0}
              blur={0}
              textColor="#f5f5f5"
              lineColor="#ffffff"
              baseColor="#525252"
              intensity={1}
              shineSize={10}
              shineFade={40}
              thickness={1}
              speed={0.35}
              followMouse
              proximity={250}
              autoAnimate={false}
              onClick={() => navigate('/booking')}
            >
              {t.home.startInquiry}
            </SpecularButton>
          </div>
        </div>
      </section>
    </Layout>
  )
}