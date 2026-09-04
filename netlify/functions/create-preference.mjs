const env = (key) => {
  try {
    const v = globalThis.Netlify?.env?.get?.(key);
    if (v != null && v !== '') return v;
  } catch (_) {}

  return process.env[key];
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });

export default async (request) => {
  const token = env('MERCADOPAGO_ACCESS_TOKEN');

  const siteUrl = String(
    env('SITE_URL') || 'https://desdeelcorazondecasa.netlify.app'
  ).replace(/\/$/, '');

  const price = Number(
    env('LAUNCH_PRICE_ARS') || 9999
  );

  /*
    Diagnóstico seguro:
    Si abrís directamente la URL de esta función en el navegador,
    te confirma que la función existe y que Netlify está leyendo
    las variables de entorno, sin mostrar tu Access Token.
  */
  if (request.method === 'GET') {
    return json({
      ok: true,
      function: 'create-preference',
      tokenConfigured: Boolean(token),
      siteUrl,
      price
    });
  }

  if (request.method !== 'POST') {
    return json(
      {
        error: 'Método no permitido'
      },
      405
    );
  }

  if (!token) {
    return json(
      {
        error:
          'Falta MERCADOPAGO_ACCESS_TOKEN en las variables de entorno de Netlify.'
      },
      500
    );
  }

  if (!Number.isFinite(price) || price <= 0) {
    return json(
      {
        error:
          'LAUNCH_PRICE_ARS debe ser un número mayor que 0.'
      },
      500
    );
  }

  const preference = {
    items: [
      {
        id: 'mama-papa-pack',
        title:
          'Mamá, papá, tengo que contarte algo — Pack completo',
        description:
          'Manual práctico y recursos complementarios en PDF',
        quantity: 1,
        currency_id: 'ARS',
        unit_price: price
      }
    ],

    back_urls: {
      success: `${siteUrl}/gracias.html`,
      pending: `${siteUrl}/pago-pendiente.html`,
      failure: `${siteUrl}/pago-error.html`
    },

    auto_return: 'approved',

    external_reference:
      `desde-el-corazon-${Date.now()}`
  };

  try {
    const mpResponse = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(preference)
      }
    );

    const raw = await mpResponse.text();

    let data = {};

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (_) {
      data = {
        raw
      };
    }

    if (!mpResponse.ok) {
      console.error(
        'Mercado Pago rechazó la preferencia',
        mpResponse.status,
        data
      );

      return json(
        {
          error:
            'Mercado Pago rechazó la creación del checkout.',
          mercadoPagoStatus:
            mpResponse.status,
          detail:
            data
        },
        502
      );
    }

    const isTestToken =
      /^TEST-/i.test(String(token));

    const redirectUrl =
      isTestToken
        ? (
            data.sandbox_init_point ||
            data.init_point
          )
        : data.init_point;

    if (!redirectUrl) {
      console.error(
        'Mercado Pago respondió sin init_point',
        data
      );

      return json(
        {
          error:
            'Mercado Pago no devolvió una URL de checkout.',
          detail:
            data
        },
        502
      );
    }

    return json({
      init_point: redirectUrl
    });

  } catch (error) {
    console.error(
      'Error interno create-preference:',
      error
    );

    return json(
      {
        error:
          'Error interno al crear la preferencia de Mercado Pago.',
        detail:
          String(
            error?.message ||
            error
          )
      },
      500
    );
  }
};
