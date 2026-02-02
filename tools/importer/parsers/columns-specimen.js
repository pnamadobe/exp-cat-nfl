/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-specimen block (typography specimen)
 * 
 * Source: https://pnamadobe.github.io/nfl-brand-guidelines/prototype.html
 * Base Block: columns
 * 
 * Block Structure:
 * - Row 1: Font name, description, character set
 * 
 * Source HTML Pattern:
 * <div class="type-specimen">
 *   <div class="type-display">FRESHMAN REGULAR</div>
 *   <p>Description text</p>
 *   <div>Character set</div>
 * </div>
 * 
 * Generated: 2026-02-02
 */
export default function parse(element, { document }) {
  // Extract font name
  const fontNameEl = element.querySelector('.type-display');
  const fontName = fontNameEl ? fontNameEl.textContent.trim() : '';
  
  // Extract description
  const descEl = element.querySelector('p');
  const description = descEl ? descEl.textContent.trim() : '';
  
  // Extract character set (last div that's not the font name)
  const divs = Array.from(element.querySelectorAll('div'));
  const charSetEl = divs.find(d => !d.classList.contains('type-display') && d.textContent.includes('ABCDEF'));
  const charSet = charSetEl ? charSetEl.textContent.trim() : '';
  
  // Build cells array
  const cells = [];
  
  // Single row with all content
  const contentCell = document.createElement('div');
  
  if (fontName) {
    const nameP = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = fontName;
    nameP.appendChild(strong);
    contentCell.appendChild(nameP);
  }
  
  if (description) {
    const descP = document.createElement('p');
    descP.textContent = description;
    contentCell.appendChild(descP);
  }
  
  if (charSet) {
    const charP = document.createElement('p');
    charP.textContent = charSet;
    contentCell.appendChild(charP);
  }
  
  cells.push([contentCell]);
  
  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns-Specimen', cells });
  
  // Replace original element with structured block table
  element.replaceWith(block);
}
