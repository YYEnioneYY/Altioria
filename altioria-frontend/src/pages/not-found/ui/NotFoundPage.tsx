import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#0c0c0c] text-white">
      <div
        aria-hidden="true"
        className="absolute -right-[0.08em] bottom-[-0.24em] -z-10 select-none text-[clamp(14rem,42vw,42rem)] font-medium leading-none tracking-[-0.09em] text-[#111111]"
      >
        404
      </div>

      <section className="flex min-h-dvh items-center px-6 py-16 sm:px-10 lg:px-16">
        <div className="max-w-4xl">
          <p className="mb-7 text-sm uppercase tracking-[0.2em] text-white/40">
            Ошибка 404
          </p>

          <h1 className="text-[clamp(3.5rem,10vw,9rem)] font-medium leading-[0.88] tracking-[-0.055em]">
            <span className="text-[#4d4d4d]">страница.</span>
            <br />
            <span>не найдена.</span>
          </h1>

          <p className="mt-10 max-w-lg text-base leading-relaxed text-white/55 sm:text-lg">
            Возможно, страница была перемещена или адрес был указан
            неправильно.
          </p>

          <Link
            to="/"
            className="group mt-10 inline-flex items-center gap-4 border-b border-white/30 pb-2 text-sm tracking-wide transition-colors hover:border-white"
          >
            Вернуться на главную

            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}