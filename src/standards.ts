const anchors: Record<string, string> = Object.fromEntries([
  '111 non-text-content', '121 audio-only-and-video-only-prerecorded', '122 captions-prerecorded',
  '123 audio-description-or-media-alternative-prerecorded', '124 captions-live', '125 audio-description-prerecorded',
  '131 info-and-relationships', '132 meaningful-sequence', '133 sensory-characteristics',
  '134 orientation', '135 identify-input-purpose', '141 use-of-color', '142 audio-control',
  '143 contrast-minimum', '144 resize-text', '145 images-of-text', '1410 reflow',
  '1411 non-text-contrast', '1412 text-spacing', '1413 content-on-hover-or-focus',
  '211 keyboard', '212 no-keyboard-trap', '214 character-key-shortcuts',
  '221 timing-adjustable', '222 pause-stop-hide', '231 three-flashes-or-below-threshold',
  '241 bypass-blocks', '242 page-titled', '243 focus-order', '244 link-purpose-in-context',
  '245 multiple-ways', '246 headings-and-labels', '247 focus-visible',
  '251 pointer-gestures', '252 pointer-cancellation', '253 label-in-name', '254 motion-actuation',
  '311 language-of-page', '312 language-of-parts', '321 on-focus', '322 on-input',
  '323 consistent-navigation', '324 consistent-identification', '331 error-identification',
  '332 labels-or-instructions', '333 error-suggestion', '334 error-prevention-legal-financial-data',
  '411 parsing', '412 name-role-value', '413 status-messages'
].map(entry => entry.split(' ')));

export function criteriaForTags(tags: string[]) {
  return tags.flatMap(tag => {
    const match = /^wcag(\d)(\d)(\d+)$/.exec(tag);
    if (!match) return [];
    const code = match.slice(1).join('.');
    const anchor = anchors[match.slice(1).join('')];
    return [{ code, url: anchor ? `https://www.w3.org/TR/WCAG21/#${anchor}` : 'https://www.w3.org/TR/WCAG21/' }];
  });
}
