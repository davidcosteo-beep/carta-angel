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

const PDF_RESOURCE_CACHE_NAME = "kabala-pdf-resources-v1";

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

const getAssetUrl = (url) => {
  if (typeof window === "undefined") {
    return String(url || "");
  }

  try {
    return new URL(url, window.location.origin).toString();
  } catch {
    return String(url || "");
  }
};

const getAssetCacheKeys = (url) => {
  const rawUrl = String(url || "");
  const absoluteUrl = getAssetUrl(rawUrl);

  if (typeof window === "undefined") {
    return [rawUrl].filter(Boolean);
  }

  try {
    const parsedUrl = new URL(absoluteUrl);
    const pathnameUrl =
      `${parsedUrl.pathname}${parsedUrl.search}`;

    return [...new Set([
      rawUrl,
      absoluteUrl,
      pathnameUrl
    ].filter(Boolean))];
  } catch {
    return [rawUrl, absoluteUrl].filter(Boolean);
  }
};

const cloneBytes = (bytes) =>
  bytes.slice(0);

const readCacheBytes = async (url) => {
  if (typeof caches === "undefined") {
    return null;
  }

  const keys = getAssetCacheKeys(url);
  const namedCache = await caches.open(PDF_RESOURCE_CACHE_NAME);

  for (const key of keys) {
    const response = await namedCache.match(key);

    if (response?.ok) {
      return response.arrayBuffer();
    }
  }

  for (const key of keys) {
    const response = await caches.match(key);

    if (response?.ok) {
      return response.arrayBuffer();
    }
  }

  return null;
};

const writeCacheResponse = async (url, response) => {
  if (
    typeof caches === "undefined" ||
    !response?.ok
  ) {
    return;
  }

  const cache = await caches.open(PDF_RESOURCE_CACHE_NAME);
  await cache.put(
    getAssetUrl(url),
    response.clone()
  );
};

export async function loadResourceAsBytes(url) {
  const cacheKey = getAssetUrl(url);
  const recursoMemoria = pdfResourceCache.get(cacheKey);

  if (recursoMemoria) {
    return cloneBytes(recursoMemoria);
  }

  const bytesCache = await readCacheBytes(url);

  if (bytesCache) {
    pdfResourceCache.set(
      cacheKey,
      cloneBytes(bytesCache)
    );

    return cloneBytes(bytesCache);
  }

  try {
    const response = await fetch(
      getAssetUrl(url),
      { cache: "force-cache" }
    );

    if (!response.ok) {
      return null;
    }

    await writeCacheResponse(url, response);

    const bytes = await response.arrayBuffer();

    pdfResourceCache.set(
      cacheKey,
      cloneBytes(bytes)
    );

    return cloneBytes(bytes);
  } catch (error) {
    console.warn(
      `No se pudo cargar recurso PDF offline/local: ${url}`,
      error
    );

    return null;
  }
}

export const loadAssetBytes = loadResourceAsBytes;

export async function loadPdfResource(url) {
  const bytes = await loadResourceAsBytes(url);

  if (bytes) {
    return bytes;
  }

  throw new Error(
    `No se pudo cargar recurso PDF offline/local: ${url}`
  );
}

const getPdfResourceGroups = () => {
  const recursosDirectos = [
    `${PDF_ASSET_BASE}/fondo.jpg`,
    `${PDF_ASSET_BASE}/flor-vida.png`,
    ...PDF_FONT_URLS,
    ...PDF_SIGNOS.map(signo =>
      `${PDF_ASSET_BASE}/signos/${signo}.png`
    )
  ].map(url => ({
    label: url,
    urls: [url]
  }));

  const gruposAngeles = Object.values(tablaCartas)
    .map(carta => carta?.angel)
    .filter(Boolean)
    .map(angel => {
      const urls = crearCandidatosAsset(
        `${PDF_ASSET_BASE}/angeles`,
        angel
      );

      return {
        label: `angel:${angel}`,
        urls
      };
    });

  const gruposMentores = Object.values(tablaMentor)
    .map(mentor => mentor?.mentor)
    .filter(Boolean)
    .map(mentor => {
      const urls = crearCandidatosAsset(
        `${PDF_ASSET_BASE}/mentores`,
        mentor
      );

      return {
        label: `mentor:${mentor}`,
        urls
      };
    });

  return [
    ...recursosDirectos,
    ...gruposAngeles,
    ...gruposMentores
  ];
};

const uniqueResourceGroups = (groups) => [
  ...new Map(
    groups.map(group => [
      group.urls.join("|"),
      group
    ])
  ).values()
];

const loadFirstAvailable = async (group) => {
  for (const url of group.urls) {
    const bytes = await loadResourceAsBytes(url);

    if (bytes) {
      return {
        ok: true,
        resource: group.label,
        url
      };
    }
  }

  return {
    ok: false,
    resource: group.label,
    urls: group.urls
  };
};

const summarizeResults = (results) => {
  const failedResources = results
    .filter(result => !result.ok)
    .map(result => ({
      resource: result.resource,
      urls: result.urls
    }));

  return {
    ok: failedResources.length === 0,
    total: results.length,
    loaded: results.length - failedResources.length,
    failed: failedResources.length,
    failedResources
  };
};

export async function preloadAllPdfResources() {
  console.info("Preparando recursos PDF offline...");

  const groups = uniqueResourceGroups(
    getPdfResourceGroups()
  );

  const results = await Promise.all(
    groups.map(loadFirstAvailable)
  );

  const summary = summarizeResults(results);

  if (summary.ok) {
    console.info(
      `Recursos PDF offline listos. Total: ${summary.loaded}.`
    );
  } else {
    console.warn(
      `Recursos PDF offline incompletos. Loaded: ${summary.loaded}. Failed: ${summary.failed}.`,
      summary.failedResources
    );
  }

  return summary;
}

export async function verifyOfflinePdfResources() {
  const groups = uniqueResourceGroups(
    getPdfResourceGroups()
  );

  const results = await Promise.all(
    groups.map(async (group) => {
      for (const url of group.urls) {
        const bytes = await readCacheBytes(url);

        if (bytes) {
          return {
            ok: true,
            resource: group.label,
            url
          };
        }
      }

      return {
        ok: false,
        resource: group.label,
        urls: group.urls
      };
    })
  );

  return summarizeResults(results);
}
