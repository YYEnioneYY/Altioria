import type {
  FormEvent,
} from 'react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  Navigate,
  useParams,
  useSearchParams,
} from 'react-router';

import {
  getPublicProduct,
} from '../../../entities/product';

import {
  createProductInquiry,
} from '../../../features/product-inquiry';

import {
  useLocale,
} from '../../../shared/lib/i18n';

interface ProductContext {
  productId: string;
  variantId?: string;
  productName: string;
  productPath: string;
}

const contentByLocale = {
  ru: {
    title: 'Форма',
    namePlaceholder: 'Имя',
    emailPlaceholder: 'Почта',
    phonePlaceholder: '+7 (___) ___-__-__',
    productPlaceholder: 'Товар',
    questionsPlaceholder: 'Вопросы',
    privacyPrefix: 'Я ознакомился и соглашаюсь с ',
    privacyLink: 'Политикой конфиденциальности',
    submit: 'Отправить',
    submitting: 'Отправляем...',
    loading: 'Загружаем информацию о товаре',
    loadError: 'Не удалось загрузить товар',
    variantNotFound:
      'Выбранное исполнение не найдено или больше не опубликовано',
    retry: 'Попробовать снова',
    back: 'Вернуться к товару',
    successTitle: 'Отправлено',
    successText:
      'Спасибо. Ваша заявка принята. Мы свяжемся с вами в ближайшее время.',
    submitError:
      'Не удалось отправить заявку. Попробуйте ещё раз.',
  },

  en: {
    title: 'Form',
    namePlaceholder: 'Name',
    emailPlaceholder: 'Mail',
    phonePlaceholder: '+7 (___) ___-__-__',
    productPlaceholder: 'Product',
    questionsPlaceholder: 'Questions',
    privacyPrefix: 'I have read and agree to the ',
    privacyLink: 'Privacy Policy',
    submit: 'Submit',
    submitting: 'Sending...',
    loading: 'Loading product information',
    loadError: 'Failed to load the product',
    variantNotFound:
      'The selected variant was not found or is no longer published',
    retry: 'Try again',
    back: 'Back to product',
    successTitle: 'Sent',
    successText:
      'Thank you. Your application has been received. We will contact you shortly.',
    submitError:
      'Failed to submit the application. Please try again.',
  },
} as const;

function formatRussianPhone(
  value: string,
): string {
  const enteredDigits =
    value.replace(/\D/g, '');

  if (!enteredDigits) {
    return '';
  }

  const localDigits =
    enteredDigits.startsWith('7') ||
    enteredDigits.startsWith('8')
      ? enteredDigits.slice(1, 11)
      : enteredDigits.slice(0, 10);

  let formatted = '+7';

  if (localDigits.length > 0) {
    formatted += ` (${localDigits.slice(0, 3)}`;
  }

  if (localDigits.length >= 3) {
    formatted += ')';
  }

  if (localDigits.length > 3) {
    formatted += ` ${localDigits.slice(3, 6)}`;
  }

  if (localDigits.length > 6) {
    formatted += `-${localDigits.slice(6, 8)}`;
  }

  if (localDigits.length > 8) {
    formatted += `-${localDigits.slice(8, 10)}`;
  }

  return formatted;
}

function LoadingState({
  text,
}: {
  text: string;
}) {
  return (
    <div
      role="status"
      className="flex min-h-[20rem] flex-col items-center justify-center text-center"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />

      <p className="mt-5 text-sm text-white/40">
        {text}
      </p>
    </div>
  );
}

export function ProductInquiryPage() {
  const {
    categorySlug,
    productSlug,
  } = useParams<{
    categorySlug: string;
    productSlug: string;
  }>();

  const [searchParams] = useSearchParams();

  const variantSlug =
    searchParams.get('variant');

  const {
    locale,
  } = useLocale();

  const content =
    contentByLocale[locale];

  const [productContext, setProductContext] =
    useState<ProductContext | null>(null);

  const [isProductLoading, setIsProductLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const [reloadVersion, setReloadVersion] =
    useState(0);

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [questions, setQuestions] =
    useState('');

  const [
    privacyAccepted,
    setPrivacyAccepted,
  ] = useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [isSuccess, setIsSuccess] =
    useState(false);

  useEffect(() => {
    if (!categorySlug || !productSlug) {
      return;
    }

    let isActive = true;

    setIsProductLoading(true);
    setLoadError(null);
    setProductContext(null);

    void getPublicProduct(
      productSlug,
      locale,
      categorySlug,
    )
      .then((product) => {
        if (!isActive) {
          return;
        }

        const selectedVariant =
          variantSlug
            ? product.variants.find(
                (variant) =>
                  variant.slug === variantSlug,
              )
            : undefined;

        if (
          variantSlug &&
          !selectedVariant
        ) {
          setLoadError(
            content.variantNotFound,
          );

          return;
        }

        setProductContext({
          productId: product.id,

          ...(selectedVariant
            ? {
                variantId:
                  selectedVariant.id,
              }
            : {}),

          productName: selectedVariant
            ? `${product.name} — ${selectedVariant.name}`
            : product.name,

          productPath:
            `/products/${categorySlug}/${productSlug}`,
        });
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setLoadError(content.loadError);
      })
      .finally(() => {
        if (isActive) {
          setIsProductLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [
    categorySlug,
    productSlug,
    variantSlug,
    locale,
    reloadVersion,
    content.loadError,
    content.variantNotFound,
  ]);

  useEffect(() => {
    document.title =
      `${content.title} — Altioria`;

    return () => {
      document.title = 'Altioria';
    };
  }, [content.title]);

  const isEmailValid = useMemo(
    () =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim(),
      ),
    [email],
  );

  const isPhoneValid =
    phone.replace(/\D/g, '').length === 11;

  const isFormValid =
    productContext !== null &&
    name.trim().length >= 2 &&
    isEmailValid &&
    isPhoneValid &&
    privacyAccepted;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !productContext ||
      !isFormValid ||
      isSubmitting
    ) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const trimmedQuestions =
        questions.trim();

      const response =
        await createProductInquiry({
          productId:
            productContext.productId,

          ...(productContext.variantId
            ? {
                variantId:
                  productContext.variantId,
              }
            : {}),

          name: name.trim(),
          email: email.trim(),
          phone,
          privacyAccepted: true,

          ...(trimmedQuestions
            ? {
                questions:
                  trimmedQuestions,
              }
            : {}),
        });

      if (!response.success) {
        throw new Error(
          content.submitError,
        );
      }

      setIsSuccess(true);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (requestError: unknown) {
      setSubmitError(
        requestError instanceof Error
          ? requestError.message
          : content.submitError,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!categorySlug || !productSlug) {
    return (
      <Navigate
        to="/products"
        replace
      />
    );
  }

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#0c0c0c] text-white">
      <section className="flex min-h-[100dvh] justify-center px-5 pb-10 pt-32 min-[1201px]:pt-[130px]">
        <div className="w-full max-w-[460px]">
          {isProductLoading && (
            <LoadingState
              text={content.loading}
            />
          )}

          {!isProductLoading &&
            loadError && (
              <div className="flex min-h-[32rem] flex-col items-center justify-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-xl text-white/40">
                  !
                </span>

                <h1 className="mt-6 text-3xl font-medium tracking-[-0.04em]">
                  {content.loadError}
                </h1>

                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/40">
                  {loadError}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setReloadVersion(
                      (current) =>
                        current + 1,
                    )
                  }
                  className="mt-7 h-[51px] rounded-full bg-white px-7 text-sm font-medium text-black transition-colors hover:bg-[#d8d8d8]"
                >
                  {content.retry}
                </button>

                <Link
                  to={`/products/${categorySlug}/${productSlug}`}
                  className="mt-4 text-sm text-white/35 transition-colors hover:text-white"
                >
                  {content.back}
                </Link>
              </div>
            )}

          {!isProductLoading &&
            !loadError &&
            productContext &&
            isSuccess && (
              <div className="flex min-h-[32rem] flex-col items-center justify-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white text-black">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-6 w-6"
                  >
                    <path
                      d="M5 12.5l4.2 4L19 7"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </span>

                <h1 className="mt-7 text-[clamp(3rem,8vw,5rem)] font-bold leading-none tracking-[-0.055em] text-[#a0a0a0]">
                  {content.successTitle}
                </h1>

                <p className="mt-6 max-w-sm text-base leading-relaxed text-white/45">
                  {content.successText}
                </p>

                <Link
                  to={productContext.productPath}
                  className="mt-8 inline-flex h-[51px] items-center justify-center rounded-full bg-white px-7 text-sm font-medium text-black transition-colors hover:bg-[#d8d8d8]"
                >
                  {content.back}
                </Link>
              </div>
            )}

          {!isProductLoading &&
            !loadError &&
            productContext &&
            !isSuccess && (
              <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-5"
              >
                <h1 className="mb-2 pl-[0.18em] text-center text-[42px] font-semibold leading-none tracking-[0.18em] text-[#a0a0a0] sm:text-[56px]">
                  {content.title}
                </h1>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  placeholder={
                    content.namePlaceholder
                  }
                  aria-label={
                    content.namePlaceholder
                  }
                  autoComplete="name"
                  minLength={2}
                  maxLength={100}
                  required
                  className="h-[51px] w-full rounded-full border-0 bg-[#363636] px-5 text-base text-white outline-none transition-[background-color,box-shadow] placeholder:text-white/40 focus:bg-[#404040] focus:shadow-[0_0_0_1px_rgba(255,255,255,0.3)]"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  placeholder={
                    content.emailPlaceholder
                  }
                  aria-label={
                    content.emailPlaceholder
                  }
                  autoComplete="email"
                  maxLength={254}
                  required
                  className="h-[51px] w-full rounded-full border-0 bg-[#363636] px-5 text-base text-white outline-none transition-[background-color,box-shadow] placeholder:text-white/40 focus:bg-[#404040] focus:shadow-[0_0_0_1px_rgba(255,255,255,0.3)]"
                />

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      formatRussianPhone(
                        event.target.value,
                      ),
                    )
                  }
                  placeholder={
                    content.phonePlaceholder
                  }
                  aria-label={
                    content.phonePlaceholder
                  }
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  className="h-[51px] w-full rounded-full border-0 bg-[#363636] px-5 text-base text-white outline-none transition-[background-color,box-shadow] placeholder:text-white/40 focus:bg-[#404040] focus:shadow-[0_0_0_1px_rgba(255,255,255,0.3)]"
                />

                <input
                  type="text"
                  value={
                    productContext.productName
                  }
                  placeholder={
                    content.productPlaceholder
                  }
                  aria-label={
                    content.productPlaceholder
                  }
                  readOnly
                  className="h-[51px] w-full cursor-default rounded-full border-0 bg-[#2a2a2a] px-5 text-base text-white/75 outline-none"
                />

                <textarea
                  value={questions}
                  onChange={(event) =>
                    setQuestions(
                      event.target.value,
                    )
                  }
                  placeholder={
                    content.questionsPlaceholder
                  }
                  aria-label={
                    content.questionsPlaceholder
                  }
                  maxLength={2000}
                  className="h-[120px] w-full resize-none rounded-[30px] border-0 bg-[#363636] px-5 py-4 text-base leading-relaxed text-white outline-none transition-[background-color,box-shadow] placeholder:text-white/40 focus:bg-[#404040] focus:shadow-[0_0_0_1px_rgba(255,255,255,0.3)]"
                />

                <div className="flex items-start gap-3 px-1">
                  <input
                    id="privacyAccepted"
                    type="checkbox"
                    checked={
                      privacyAccepted
                    }
                    onChange={(event) =>
                      setPrivacyAccepted(
                        event.target.checked,
                      )
                    }
                    required
                    className="peer sr-only"
                  />

                  <label
                    htmlFor="privacyAccepted"
                    className="mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-[5px] border border-white/25 bg-transparent text-black transition-colors peer-checked:border-white peer-checked:bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-white/30"
                  >
                    {privacyAccepted && (
                      <svg
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          d="M4 10.5l3.5 3.5L16 6"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                  </label>

                  <p className="text-sm leading-[1.5] text-[#a0a0a0]">
                    <label
                      htmlFor="privacyAccepted"
                      className="cursor-pointer"
                    >
                      {content.privacyPrefix}
                    </label>

                    <Link
                      to="/privacy-policy"
                      className="text-[#e8e8e8] underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
                    >
                      {content.privacyLink}
                    </Link>

                    .
                  </p>
                </div>

                {submitError && (
                  <p
                    role="alert"
                    className="rounded-2xl border border-[#d99595]/20 bg-[#211515] px-4 py-3 text-sm leading-relaxed text-[#e4aaaa]"
                  >
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={
                    !isFormValid ||
                    isSubmitting
                  }
                  className="h-[51px] w-full rounded-full border-0 bg-white px-5 text-base font-medium text-black transition-[background-color,color,transform] duration-300 hover:bg-[#d8d8d8] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#363636] disabled:text-white/25"
                >
                  {isSubmitting
                    ? content.submitting
                    : content.submit}
                </button>
              </form>
            )}
        </div>
      </section>
    </main>
  );
}