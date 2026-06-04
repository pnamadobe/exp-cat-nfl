/*
 * Player Spotlight Block
 * Renders an NFL Player Spotlight Content Fragment, fetched live from AEM
 * via a CORS-enabled GraphQL persisted query. Editing + publishing the
 * fragment in AEM updates this block on the next page load — no code deploy.
 *
 * Authoring (DA):
 *   | player-spotlight | /content/dam/26H1/nfl/patrick-mahomes |
 */

// AEM publish (delivery) tier — anonymous, CORS-enabled for *.aem.page.
const AEM_PUBLISH = 'https://publish-p59602-e520244.adobeaemcloud.com';
// GraphQL configuration name + persisted query that takes a `path` parameter.
const GRAPHQL_CONFIG = 'aem-demo-assets';
const PERSISTED_QUERY = 'nfl-player-by-path';

/**
 * Fetch a single NFL Player Spotlight fragment by its DAM path.
 * @param {string} path DAM path, e.g. /content/dam/26H1/nfl/patrick-mahomes
 * @returns {Promise<object|null>} the fragment fields, or null on failure
 */
async function fetchPlayer(path) {
  // Persisted-query GET: params are appended as ;name=value. The whole
  // ;path=<value> suffix must be encoded as one unit (AEM decodes the path
  // segment once, then parses the matrix param) — encoding only the value
  // leaves a literal ;path=%2F... that AEM fails to resolve.
  const param = encodeURIComponent(`;path=${path}`);
  const url = `${AEM_PUBLISH}/graphql/execute.json/${GRAPHQL_CONFIG}/${PERSISTED_QUERY}${param}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const json = await resp.json();
    return json?.data?.nflPlayerSpotlightByPath?.item ?? null;
  } catch (e) {
    // network / CORS failure (e.g. an editor origin AEM doesn't allow)
    return null;
  }
}

/**
 * Same-origin snapshot used only when the live AEM fetch is blocked — namely
 * inside editors (Universal Editor / DA) whose origin AEM's CORS doesn't allow.
 * players.json is served from the same host as this module, so no CORS applies.
 * The published site always uses live data; this just powers the editor preview.
 * @param {string} path DAM path
 * @returns {Promise<object|null>}
 */
async function fetchPreview(path) {
  try {
    const resp = await fetch(new URL('./players.json', import.meta.url));
    if (!resp.ok) return null;
    const data = await resp.json();
    return data[path] ?? null;
  } catch (e) {
    return null;
  }
}

/**
 * Build the card markup for a player.
 * @param {object} p player fields from GraphQL
 * @returns {HTMLElement}
 */
function renderPlayer(p) {
  const card = document.createElement('article');
  card.className = 'player-spotlight-card';

  const quote = p.playerQuote?.plaintext ?? '';
  const highlight = p.careerHighlight?.plaintext ?? '';
  const accolades = Array.isArray(p.accolades) ? p.accolades : [];
  const meta = [p.division, p.college, p.hometown].filter(Boolean).join(' &middot; ');
  const accoladesHtml = accolades.map((a) => `<li>${a}</li>`).join('');

  card.innerHTML = `
    <div class="player-spotlight-jersey" aria-hidden="true">${p.jerseyNumber ?? ''}</div>
    <div class="player-spotlight-content">
      <p class="player-spotlight-position">${p.position ?? ''} &middot; ${p.team ?? ''}</p>
      <h3 class="player-spotlight-name">${p.playerName ?? ''}</h3>
      <p class="player-spotlight-meta">${meta}</p>
      ${quote ? `<blockquote class="player-spotlight-quote">${quote}</blockquote>` : ''}
      ${highlight ? `<p class="player-spotlight-highlight">${highlight}</p>` : ''}
      ${accolades.length ? `<ul class="player-spotlight-accolades">${accoladesHtml}</ul>` : ''}
    </div>
  `;
  return card;
}

/**
 * Visible placeholder shown when the live CF can't be fetched (e.g. inside an
 * editor whose origin AEM's CORS allowlist doesn't cover, like *.ue.da.live).
 * Keeps the block selectable/editable instead of collapsing to nothing.
 * @param {string} path the bound CF path
 * @returns {HTMLElement}
 */
function renderPlaceholder(path) {
  const el = document.createElement('div');
  el.className = 'player-spotlight-card player-spotlight-placeholder';
  el.innerHTML = `
    <div class="player-spotlight-content">
      <p class="player-spotlight-position">Player Spotlight</p>
      <h3 class="player-spotlight-name">Content Fragment</h3>
      <p class="player-spotlight-meta">${path || '(no path set)'}</p>
      <p class="player-spotlight-highlight">
        Live preview is only available on the published site.
      </p>
    </div>
  `;
  return el;
}

export default async function decorate(block) {
  // The CF path comes from the first cell — could be plain text, a link href,
  // or an absolute URL (depending on how DA/UE authored it). Pull out the
  // /content/dam/... portion so any of those forms resolve.
  const link = block.querySelector('a');
  const raw = (link ? link.getAttribute('href') : block.textContent).trim();
  const match = raw.match(/\/content\/dam\/[^\s"']+/);
  const path = match ? match[0] : raw;

  block.textContent = '';
  block.dataset.cfPath = path;

  // Live AEM data on the published site; same-origin snapshot in editors where
  // the cross-origin AEM fetch is CORS-blocked. Placeholder only if both miss.
  let player = null;
  if (path.startsWith('/content/dam')) {
    player = await fetchPlayer(path) || await fetchPreview(path);
  }

  block.append(player ? renderPlayer(player) : renderPlaceholder(path));
}
