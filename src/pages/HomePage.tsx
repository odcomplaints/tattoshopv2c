import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { WorkSlideshow } from '../components/WorkSlideshow'
import { newestWork } from '../data/work'

export function HomePage() {
  return (
    <Layout>
      <section className="mx-auto flex min-h-[58svh] max-w-4xl flex-col items-center justify-center pb-5 text-center">
        <p className="text-xs uppercase tracking-widest text-accent">Tattoo Artist / GD</p>
        <h1 className="mt-5 text-5xl font-semibold uppercase leading-[0.95] tracking-wide text-neutral-100 sm:text-7xl">OD: COMPLAINTS</h1>
        <p className="mt-5 text-base uppercase tracking-[0.3em] text-accent sm:text-lg">Get your next Regret</p>
        <p className="mt-6 max-w-xl text-sm leading-7 text-neutral-400">Blackwork, fineline and botanical motifs. Individual tattoos, considered carefully and executed with precision.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link to="/booking" className="button-label w-fit border border-accent px-5 py-3 text-xs uppercase tracking-widest transition-colors hover:border-neutral-100">Book a Session</Link>
          <Link to="/work" className="button-label w-fit border border-accent px-5 py-3 text-xs uppercase tracking-widest transition-colors hover:border-neutral-100">Portfolio</Link>
        </div>
        <div className="mx-auto mt-4 h-px w-24 bg-accent" aria-hidden="true" />
      </section>
      <section className="pt-5 text-center sm:pt-8">
        <div className="mb-8 flex flex-col items-center justify-center gap-3">
          <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-100">Latest work</h2>
          <Link className="text-xs uppercase tracking-widest text-neutral-500 transition-colors hover:text-accent" to="/work">View all work</Link>
        </div>
        <WorkSlideshow items={newestWork.slice(0, 6)} />
      </section>
      <section className="mt-5 py-5 text-center sm:mt-8 sm:py-8">
        <div className="mx-auto grid max-w-2xl gap-6">
          <div><p className="text-xs uppercase tracking-widest text-accent">Studio</p><h2 className="mt-3 text-2xl font-medium uppercase tracking-widest text-neutral-100">The body comes first</h2></div>
          <div className="space-y-5 text-sm leading-7 text-neutral-400">
            <p>I work with the body, never against it. Lines follow tension, forms respond to movement and every motif is made for its placement.</p>
            <p>Each session is a shared process: we establish direction and atmosphere before the final drawing is developed with precision for you.</p>
            <Link className="inline-block text-xs uppercase tracking-widest text-neutral-300 transition-colors hover:text-accent" to="/about">About the studio</Link>
          </div>
        </div>
        <div className="mx-auto mt-4 h-px w-24 bg-accent sm:mt-6" aria-hidden="true" />
      </section>
      <section className="py-5 text-center sm:py-8">
        <p className="text-xs uppercase tracking-widest text-accent">Process</p>
        <h2 className="mt-3 text-2xl font-medium uppercase tracking-widest text-neutral-100">From idea to session</h2>
        <ol className="mt-10 grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['01', 'Inquiry', 'Send your idea, placement, size and references.'],
            ['02', 'Alignment', 'I reply with an assessment and possible dates.'],
            ['03', 'Design', 'Your design is developed and refined for its placement.'],
            ['04', 'Session', 'At the studio, we apply the motif with focus and precision.'],
          ].map(([number, title, text]) => <li key={number} className="p-5 sm:p-6"><span className="text-xs text-accent">{number}</span><h3 className="mt-8 text-xs font-medium uppercase tracking-widest text-neutral-100">{title}</h3><p className="mt-3 text-sm leading-6 text-neutral-500">{text}</p></li>)}
        </ol>
      </section>
      <section className="py-5 text-center sm:py-8">
        <div className="mx-auto mb-4 h-px w-24 bg-accent sm:mb-6" aria-hidden="true" />
        <div className="mx-auto grid max-w-2xl gap-8">
          <div><p className="text-xs uppercase tracking-widest text-accent">Guide</p><h2 className="mt-3 text-2xl font-medium uppercase tracking-widest text-neutral-100">Time &amp; budget</h2><p className="mx-auto mt-5 max-w-md text-sm leading-7 text-neutral-400">Every project is quoted individually. These ranges offer a first orientation and do not replace a personal quote.</p></div>
          <dl className="text-sm">
            <div className="flex items-baseline justify-center gap-4 py-4"><dt className="text-neutral-200">Small motifs</dt><dd className="text-neutral-500">from 180 EUR</dd></div>
            <div className="flex items-baseline justify-center gap-4 py-4"><dt className="text-neutral-200">Medium projects</dt><dd className="text-neutral-500">3-4 hours</dd></div>
            <div className="flex items-baseline justify-center gap-4 py-4"><dt className="text-neutral-200">Large work</dt><dd className="text-neutral-500">on request</dd></div>
            <div className="flex items-baseline justify-center gap-4 py-4"><dt className="text-neutral-200">Day session</dt><dd className="text-neutral-500">by arrangement</dd></div>
          </dl>
        </div>
      </section>
      <section className="py-5 text-center sm:py-8">
        <div className="mx-auto mb-4 h-px w-24 bg-accent sm:mb-6" aria-hidden="true" />
        <div className="mx-auto grid max-w-2xl gap-8">
          <div><p className="text-xs uppercase tracking-widest text-accent">Before your session</p><h2 className="mt-3 text-2xl font-medium uppercase tracking-widest text-neutral-100">Come prepared</h2></div>
          <ul className="grid gap-4 text-sm leading-7 text-neutral-400 sm:grid-cols-2">
            {['Arrive rested, hydrated and with clean skin.', 'Eat well beforehand and allow enough time.', 'Avoid alcohol and other blood-thinning substances the day before.', 'Bring a small selection of references when useful.'].map((item) => <li key={item} className="flex items-start justify-center gap-2 px-4 py-3"><span className="text-accent">+</span><span>{item}</span></li>)}
          </ul>
        </div>
      </section>
      <section className="py-5 text-center sm:py-8">
        <div className="mx-auto mb-4 h-px w-24 bg-accent sm:mb-6" aria-hidden="true" />
        <p className="text-xs uppercase tracking-widest text-accent">Questions</p>
        <h2 className="mt-3 text-2xl font-medium uppercase tracking-widest text-neutral-100">FAQ</h2>
        <div className="mx-auto mt-8 max-w-2xl">
          {[
            ['Do you work with flash?', 'Occasional flash designs are available. The focus is on individual projects.'],
            ['Can I bring references?', 'Yes. They help establish direction, visual language and atmosphere.'],
            ['When will I see the design?', 'For custom work we align on the direction before your appointment; the final drawing is shaped for the placement.'],
          ].map(([question, answer]) => <details key={question} className="py-4"><summary className="cursor-pointer text-xs uppercase tracking-widest text-neutral-200 transition-all duration-200 hover:scale-110 hover:text-accent">{question}</summary><p className="mt-3 text-sm leading-7 text-neutral-500">{answer}</p></details>)}
        </div>
      </section>
      <section className="pt-5 text-center sm:pt-8">
        <div className="mx-auto mb-4 h-px w-24 bg-accent sm:mb-6" aria-hidden="true" />
        <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10 sm:py-14">
          <p className="text-xs uppercase tracking-widest text-neutral-200">GD / Private Studio</p>
          <h2 className="mt-4 text-3xl font-medium uppercase leading-tight tracking-widest sm:text-4xl">Ready to start a project together?</h2>
          <Link to="/booking" className="button-label mt-8 inline-block border border-accent px-5 py-3 text-xs uppercase tracking-widest transition-colors hover:border-neutral-100">Start an inquiry</Link>
        </div>
      </section>
    </Layout>
  )
}