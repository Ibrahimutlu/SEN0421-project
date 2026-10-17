(() => {
    const parseColor = (value) => {
      const match = value.match(/^rgba?\(([^)]+)\)$/);
      if (!match) return null;
      const values = match[1].split(/[,\s/]+/).map(Number);
      return values.length >= 3 ? [...values.slice(0, 3), values[3] ?? 1] : null;
    };
    const selector = (node) => {
      const parts = [];
      for (let current = node; current && parts.length < 8; current = current.parentElement) {
        if (current.id) { parts.unshift(`#${CSS.escape(current.id)}`); break; }
        const index = current.parentElement ? Array.from(current.parentElement.children).indexOf(current) + 1 : 1;
        parts.unshift(`${current.tagName.toLowerCase()}:nth-child(${index})`);
      }
      return parts.join(' > ');
    };
    const items = [];
    let examined = 0;
    let truncated = false;
    for (const node of document.querySelectorAll('body, body *')) {
      if (!Array.from(node.childNodes).some(child => child.nodeType === Node.TEXT_NODE && child.textContent?.trim())) continue;
      if (node.closest('script,style,noscript,template,[hidden]')) continue;
      const style = getComputedStyle(node);
      if (style.visibility !== 'visible' || !node.getClientRects().length) continue;
      if (++examined > 500) { truncated = true; break; }
      const foreground = parseColor(style.color);
      let background = null;
      let uncertain = null;
      if (node.namespaceURI !== 'http://www.w3.org/1999/xhtml') uncertain = 'Non-HTML text requires manual review.';
      if (style.textShadow !== 'none' || style.webkitTextStrokeWidth !== '0px' || style.mixBlendMode !== 'normal') uncertain = 'Text effects require manual review.';
      for (let current = node; current; current = current.parentElement) {
        const computed = getComputedStyle(current);
        if (Number(computed.opacity) < 1 || computed.filter !== 'none' || computed.backgroundImage !== 'none' || computed.mixBlendMode !== 'normal') {
          uncertain = 'Image, gradient, transparency or blending requires manual review.';
        }
        for (const pseudo of ['::before', '::after']) {
          const overlay = getComputedStyle(current, pseudo);
          if (overlay.content !== 'none' && overlay.content !== 'normal') uncertain = 'Generated content requires manual review.';
        }
        if (!background) {
          const candidate = parseColor(computed.backgroundColor);
          if (!candidate) uncertain = 'The background color could not be resolved.';
          else if (candidate[3] === 1) background = candidate;
          else if (candidate[3] > 0) uncertain = 'Translucent backgrounds require manual review.';
        }
      }
      if (!foreground || foreground[3] !== 1) uncertain = 'The foreground is transparent or unsupported.';
      const rect = node.getBoundingClientRect();
      const covering = document.elementFromPoint(Math.max(0, Math.min(innerWidth - 1, rect.left + rect.width / 2)), Math.max(0, Math.min(innerHeight - 1, rect.top + rect.height / 2)));
      if (covering && covering !== node && !node.contains(covering) && !covering.contains(node)) uncertain = 'Overlapping content requires manual review.';
      items.push({
        selector: selector(node), text: (node.textContent ?? '').trim().slice(0, 120),
        foreground: foreground?.slice(0, 3) ?? null, background: background?.slice(0, 3) ?? [255, 255, 255],
        fontSizePx: Number.parseFloat(style.fontSize), fontWeight: Number.parseInt(style.fontWeight) || 400,
        reason: uncertain, disabled: node.matches(':disabled')
      });
    }
    return { items, truncated };
})()
