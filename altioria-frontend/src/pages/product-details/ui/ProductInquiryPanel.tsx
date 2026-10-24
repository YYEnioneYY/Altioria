import type {
  FormEvent,
} from 'react';

import {
  useMemo,
  useState,
} from 'react';

import {
  Link,
} from 'react-router';

import {
  createProductInquiry,
} from '../../../features/product-inquiry';

interface ProductInquiryPanelProps {
  locale: 'ru' | 'en';
  productId: string;
  variantId?: string;
  productName: string;
  onBack: () => void;
}

const contentByLocale = {
  ru: {
    section: 'заявка',
    back: 'описание',
    name: 'Имя',
    phone: 'Телефон',
    email: 'Почта',
    questions: 'Вопросы',
    privacyPrefix:
      'Я ознакомился и соглашаюсь с ',
    privacyLink:
      'Политикой конфиденциальности',
    submit: 'Отправить заявку',
    submitting: 'Отправляем...',
    error:
      'Не удалось отправить заявку. Попробуйте ещё раз.',
    success: 'Заявка отправлена',
    successDescription:
      'Спасибо. Мы получили вашу заявку и свяжемся с вами в ближайшее время.',
    another: 'Отправить ещё одну',
  },

  en: {
    section: 'application',
    back: 'description',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    questions: 'Questions',
    privacyPrefix:
      'I have read and agree to the ',
    privacyLink: 'Privacy Policy',
    submit: 'Submit application',
    submitting: 'Sending...',
    error:
      'Failed to submit the application. Please try again.',
    success: 'Application sent',
    successDescription:
      'Thank you. We have received your application and will contact you shortly.',
    another: 'Send another',
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
    formatted +=
      ` (${localDigits.slice(0, 3)}`;
  }

  if (localDigits.length >= 3) {
    formatted += ')';
  }

  if (localDigits.length > 3) {
    formatted +=
      ` ${localDigits.slice(3, 6)}`;
  }

  if (localDigits.length > 6) {
    formatted +=
      `-${localDigits.slice(6, 8)}`;
  }

  if (localDigits.length > 8) {
    formatted +=
      `-${localDigits.slice(8, 10)}`;
  }

  return formatted;
}

export function ProductInquiryPanel({
  locale,
  productId,
  variantId,
  productName,
  onBack,
}: ProductInquiryPanelProps) {
  const content =
    contentByLocale[locale];

  const [name, setName] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [email, setEmail] =
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
    name.trim().length >= 2 &&
    isEmailValid &&
    isPhoneValid &&
    privacyAccepted;

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setQuestions('');
    setPrivacyAccepted(false);
    setSubmitError(null);
    setIsSuccess(false);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
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
          productId,

          ...(variantId
            ? {
                variantId,
              }
            : {}),

          name: name.trim(),
          phone,
          email: email.trim(),
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
          content.error,
        );
      }

      setIsSuccess(true);
    } catch (requestError: unknown) {
      setSubmitError(
        requestError instanceof Error
          ? requestError.message
          : content.error,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <section className="product-information-panel product-inquiry-success">
        <span className="product-panel-label">
          {content.section}
        </span>

        <div className="product-inquiry-success-content">
          <span className="product-inquiry-success-icon">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M5 12.5l4.2 4L19 7"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </span>

          <h2>
            {content.success}
          </h2>

          <p>
            {content.successDescription}
          </p>

          <div className="product-inquiry-success-actions">
            <button
              type="button"
              onClick={resetForm}
            >
              {content.another}
            </button>

            <button
              type="button"
              onClick={onBack}
            >
              {content.back}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="product-information-panel product-inquiry-form"
    >
      <div className="product-inquiry-heading">
        <span className="product-panel-label">
          {content.section}
        </span>

        <button
          type="button"
          onClick={onBack}
          className="product-inquiry-back"
        >
          {content.back}
        </button>
      </div>

      <p className="sr-only">
        {productName}
      </p>

      <label className="product-inquiry-field">
        <span>{content.name}</span>

        <input
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="..."
          autoComplete="name"
          minLength={2}
          maxLength={100}
          required
        />
      </label>

      <label className="product-inquiry-field">
        <span>{content.phone}</span>

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
          placeholder="..."
          autoComplete="tel"
          inputMode="tel"
          required
        />
      </label>

      <label className="product-inquiry-field">
        <span>{content.email}</span>

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="..."
          autoComplete="email"
          maxLength={254}
          required
        />
      </label>

      <label className="product-inquiry-field product-inquiry-question">
        <span>
          {content.questions}
        </span>

        <textarea
          value={questions}
          onChange={(event) =>
            setQuestions(
              event.target.value,
            )
          }
          placeholder="..."
          maxLength={2000}
        />
      </label>

      <div className="product-inquiry-privacy">
        <input
          id="product-inquiry-privacy"
          type="checkbox"
          checked={privacyAccepted}
          onChange={(event) =>
            setPrivacyAccepted(
              event.target.checked,
            )
          }
          required
        />

        <label
          htmlFor="product-inquiry-privacy"
          className="product-inquiry-checkbox"
        >
          {privacyAccepted && (
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
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

        <p>
          <label
            htmlFor="product-inquiry-privacy"
          >
            {content.privacyPrefix}
          </label>

          <Link
            to={`/${locale}/privacy-policy`}
          >
            {content.privacyLink}
          </Link>
        </p>
      </div>

      {submitError && (
        <p
          role="alert"
          className="product-inquiry-error"
        >
          {submitError}
        </p>
      )}

      <div className="product-inquiry-submit-wrapper">
        <button
          type="submit"
          disabled={
            !isFormValid ||
            isSubmitting
          }
          className="product-inquiry-submit"
        >
          {isSubmitting
            ? content.submitting
            : content.submit}
        </button>
      </div>
    </form>
  );
}