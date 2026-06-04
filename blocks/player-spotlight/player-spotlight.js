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
  // Persisted-query GET: params are appended as ;name=value with the value
  // URL-encoded (slashes become %2F).
  const url = `${AEM_PUBLISH}/graphql/execute.json/${GRAPHQL_CONFIG}/${PERSISTED_QUERY}`
    + `;path=${encodeURIComponent(path)}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const json = await resp.json();
    return json?.data?.nflPlayerSpotlightByPath?.item ?? null;
  } catch (e) {
    // network / CORS failure — leave the block empty rather than break the page
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

export default async function decorate(block) {
  // The CF path comes from the first cell — either a link or plain text.
  const link = block.querySelector('a');
  const path = (link ? link.getAttribute('href') : block.textContent).trim();

  block.textContent = '';
  block.dataset.cfPath = path;

  if (!path || !path.startsWith('/content/dam')) {
    block.classList.add('player-spotlight-error');
    return;
  }

  const player = await fetchPlayer(path);
  if (!player) {
    block.classList.add('player-spotlight-error');
    return;
  }

  block.append(renderPlayer(player));
}
