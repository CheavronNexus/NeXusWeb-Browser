/**
 * mediaInjector.js
 * Injected scripts for Picture-in-Picture, Distraction-free Reader Mode,
 * and Media HUD state synchronization.
 */

const PIP_INJECTOR_SCRIPT = `
(async function() {
  try {
    const videos = Array.from(document.querySelectorAll('video'));
    if (videos.length === 0) return { success: false, error: 'No video element found on this page' };
    const targetVideo = videos.find(v => !v.paused) || videos.sort((a,b) => (b.offsetWidth * b.offsetHeight) - (a.offsetWidth * a.offsetHeight))[0];
    if (!targetVideo) return { success: false, error: 'No suitable video found' };

    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      return { success: true, pip: false, message: 'Exited Picture-in-Picture' };
    } else {
      await targetVideo.requestPictureInPicture();
      return { success: true, pip: true, message: 'Floating video active 📺' };
    }
  } catch(e) {
    return { success: false, error: e.message };
  }
})()
`

const READER_MODE_EXTRACTOR_SCRIPT = `
(function() {
  try {
    const title = document.title || document.querySelector('h1')?.innerText || 'Article';
    const byline = document.querySelector('meta[name="author"]')?.content ||
                   document.querySelector('[rel="author"]')?.innerText ||
                   document.querySelector('.author, .byline')?.innerText || '';
    
    const leadImg = document.querySelector('article img, main img, .post-content img, .article-body img')?.src ||
                    document.querySelector('meta[property="og:image"]')?.content || '';

    const articleElem = document.querySelector('article') ||
                        document.querySelector('main') ||
                        document.querySelector('.post-content, .article-body, .entry-content, .content, #content') ||
                        document.body;

    const clone = articleElem.cloneNode(true);

    const removeSelectors = [
      'script', 'style', 'noscript', 'nav', 'header', 'footer',
      'aside', '.ad', '.ads', '.advertisement', '.sidebar',
      '.social-share', '.comments', '.comment-section', '.nav',
      'iframe', 'svg', 'button', 'form'
    ];
    removeSelectors.forEach(sel => {
      clone.querySelectorAll(sel).forEach(el => el.remove());
    });

    const contentNodes = Array.from(clone.querySelectorAll('p, h1, h2, h3, h4, h5, h6, blockquote, pre, code, ul, ol, img'));
    let cleanHtml = '';
    let textOnly = '';

    contentNodes.forEach(node => {
      const text = node.innerText.trim();
      if (node.tagName.toLowerCase() === 'img') {
        const src = node.getAttribute('src');
        if (src && !src.startsWith('data:image/svg') && node.naturalWidth > 100) {
          cleanHtml += \`<div class="reader-img-wrap"><img src="\${src}" alt="" /></div>\`;
        }
      } else if (text.length > 0) {
        const tag = node.tagName.toLowerCase();
        cleanHtml += \`<\${tag}>\${node.innerHTML}</\${tag}>\`;
        textOnly += text + ' ';
      }
    });

    const wordCount = textOnly.split(/\\s+/).filter(Boolean).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    return {
      success: true,
      title,
      byline,
      leadImg,
      cleanHtml: cleanHtml || \`<p>\${clone.innerText.slice(0, 3000)}</p>\`,
      wordCount,
      readingTimeMinutes,
      url: window.location.href,
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
})()
`

const MEDIA_HUD_CONTROL_SCRIPT = (command, value) => `
(function() {
  try {
    const mediaList = Array.from(document.querySelectorAll('video, audio'));
    if (mediaList.length === 0) return { success: false, error: 'No media found' };
    const primary = mediaList.find(m => !m.paused) || mediaList[0];

    switch ('${command}') {
      case 'play-pause':
        if (primary.paused) primary.play();
        else primary.pause();
        return { success: true, paused: primary.paused, isPlaying: !primary.paused };
      
      case 'skip-forward':
        primary.currentTime = Math.min(primary.duration || Infinity, primary.currentTime + 10);
        return { success: true, currentTime: primary.currentTime, duration: primary.duration };

      case 'skip-backward':
        primary.currentTime = Math.max(0, primary.currentTime - 10);
        return { success: true, currentTime: primary.currentTime, duration: primary.duration };

      case 'seek':
        if (typeof ${value} === 'number') {
          primary.currentTime = ${value};
        }
        return { success: true, currentTime: primary.currentTime };

      case 'volume':
        if (typeof ${value} === 'number') {
          primary.volume = Math.max(0, Math.min(1, ${value}));
          if (primary.volume > 0) primary.muted = false;
        }
        return { success: true, volume: primary.volume, muted: primary.muted };

      case 'rate':
        if (typeof ${value} === 'number') {
          primary.playbackRate = ${value};
        }
        return { success: true, playbackRate: primary.playbackRate };

      case 'mute-toggle':
        primary.muted = !primary.muted;
        return { success: true, muted: primary.muted };

      case 'get-state':
        return {
          success: true,
          hasMedia: true,
          paused: primary.paused,
          isPlaying: !primary.paused,
          currentTime: primary.currentTime || 0,
          duration: primary.duration || 0,
          volume: primary.volume || 1,
          muted: !!primary.muted,
          playbackRate: primary.playbackRate || 1,
          videoTitle: document.title,
        };

      default:
        return { success: true };
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
})()
`

module.exports = {
  PIP_INJECTOR_SCRIPT,
  READER_MODE_EXTRACTOR_SCRIPT,
  MEDIA_HUD_CONTROL_SCRIPT,
}
