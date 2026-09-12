export interface CreateProductInquiryInput {
  productId: string;
  variantId?: string;
  name: string;
  email: string;
  phone: string;
  questions?: string;
  privacyAccepted: boolean;
}

export interface CreateProductInquiryResponse {
  success: boolean;
}

interface ApiErrorResponse {
  message?: string | string[];
}

export class ProductInquiryApiError extends Error {
  public readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name = 'ProductInquiryApiError';
    this.status = status;
  }
}

async function getErrorMessage(
  response: Response,
): Promise<string | null> {
  try {
    const body =
      (await response.json()) as ApiErrorResponse;

    if (Array.isArray(body.message)) {
      return body.message[0] ?? null;
    }

    return body.message ?? null;
  } catch {
    return null;
  }
}

export async function createProductInquiry(
  input: CreateProductInquiryInput,
): Promise<CreateProductInquiryResponse> {
  let response: Response;

  try {
    response = await fetch(
      '/api/product-inquiries',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      },
    );
  } catch {
    throw new ProductInquiryApiError(
      'Не удалось подключиться к серверу',
      0,
    );
  }

  if (!response.ok) {
    const serverMessage =
      await getErrorMessage(response);

    throw new ProductInquiryApiError(
      serverMessage ??
        'Не удалось отправить заявку',
      response.status,
    );
  }

  return response.json() as Promise<CreateProductInquiryResponse>;
}