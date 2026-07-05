import { tablaCartas } from "../core/tablaCartas";
import { tablaMentor } from "../core/tablaMentor";

export const PDF_ASSET_BASE = "/assets/pdf";

export const PDF_FONT_URLS = [
  "/assets/fonts/Cinzel-Bold.ttf",
  "/assets/fonts/CinzelDecorative-Bold.ttf",
  "/assets/fonts/Cardo-Regular.ttf",
  "/assets/fonts/Cardo-Bold.ttf",
  "/assets/fonts/UnifrakturCook-Bold.ttf"
];

const PDF_RESOURCE_CACHE_NAME = "kabala-pro-pdf-resources-v1";

const PDF_SIGNOS = [
  "aries",
  "tauro",
  "geminis",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "escorpio",
  "sagitario",
  "capricornio",
  "acuario",
  "piscis"
];

const pdfResourceCache = new Map();

export const normalizarNombreAsset = (valor) =>
  String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/['\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const crearCandidatosAsset = (
  basePath,
  nombre,
  extensiones = ["png"]
) => {
  const raw = String(nombre || "").trim();
  const lower = raw.toLowerCase();
  const normalizado = normalizarNombreAsset(raw);
  const sinGuiones = normalizado.replace(/-/g, "");

  const nombres = [
    normalizado,
    lower,
    sinGuiones,
    raw
  ].filter(Boolean);

  return [...new Set(
    nombres.flatMap(nombreBase =>
      extensiones.map(extension =>
        `${basePath}/${encodeURIComponent(nombreBase)}.${extension}`
      )
    )
  )];
};

export async function loadPdfResource(url) {
  const recursoMemoria = pdfResourceCache.get(url);

  if (recursoMemoria) {
    return recursoMemoria.slice(0);
  }

  try {
    if (typeof caches !== "undefined") {
      const respuestaCache = await caches.match(url);

      if (respuestaCache?.ok) {
        const bytesCache = await respuestaCache.arrayBuffer();
        pdfResourceCache.set(url, bytesCache.slice(0));

        return bytesCache.slice(0);
      }
    }

    const response = await fetch(url, { cache: "force-cache" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    if (typeof caches !== "undefined") {
      const cache = await caches.open(PDF_RESOURCE_CACHE_NAME);
      await cache.put(url, response.clone());
    }

    const bytes = await response.arrayBuffer();
    pdfResourceCache.set(url, bytes.slice(0));

    return bytes.slice(0);
  } catch (error) {
    console.warn(
      `Could not load PDF resource offline/local: ${url}`,
      error
    );

    throw new Error(
      `Could not load PDF resource offline/local: ${url}`,
      { cause: error }
    );
  }
}

const preloadFirstAvailable = async (urls) => {
  let lastError = null;

  for (const url of urls) {
    try {
      await loadPdfResource(url);
      return {
        loaded: 1,
        failed: 0
      };
    } catch (error) {
      lastError = error;
    }
  }

  console.warn(
    `Could not preload PDF offline resource: ${urls.join(", ")}`,
    lastError
  );

  return {
    loaded: 0,
    failed: 1
  };
};

export async function preloadAllPdfResources() {
  console.info("Preloading PDF offline resources...");

  const recursosDirectos = [
    `${PDF_ASSET_BASE}/fondo.jpg`,
    `${PDF_ASSET_BASE}/flor-vida.png`,
    ...PDF_FONT_URLS,
    ...PDF_SIGNOS.map(signo => `${PDF_ASSET_BASE}/signos/${signo}.png`)
  ];

  const gruposCandidatos = [
    ...Object.values(tablaCartas)
      .map(carta => carta?.angel)
      .filter(Boolean)
      .map(angel =>
        crearCandidatosAsset(`${PDF_ASSET_BASE}/angeles`, angel)
      ),
    ...Object.values(tablaMentor)
      .map(mentor => mentor?.mentor)
      .filter(Boolean)
      .map(mentor =>
        crearCandidatosAsset(`${PDF_ASSET_BASE}/mentores`, mentor)
      )
  ];

  let loaded = 0;
  let failed = 0;

  await Promise.all(
    [...new Set(recursosDirectos)].map(async (url) => {
      try {
        await loadPdfResource(url);
        loaded += 1;
      } catch (error) {
        failed += 1;
        console.warn(
          `Could not preload PDF offline resource: ${url}`,
          error
        );
      }
    })
  );

  const gruposUnicos = [
    ...new Map(
      gruposCandidatos.map(candidatos => [
        candidatos.join("|"),
        candidatos
      ])
    ).values()
  ];

  const resultados = await Promise.all(
    gruposUnicos.map(preloadFirstAvailable)
  );

  resultados.forEach((resultado) => {
    loaded += resultado.loaded;
    failed += resultado.failed;
  });

  console.info(
    `PDF offline resources preloaded. Loaded: ${loaded}. Failed: ${failed}.`
  );

  return {
    loaded,
    failed
  };
}
