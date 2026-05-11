const lightbox = document.getElementById('lightbox');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxDescription = document.getElementById('lightboxDescription');
const lightboxLinks = document.getElementById('lightboxLinks');
const carouselTrack = document.getElementById('carouselTrack');
const carouselDots = document.getElementById('carouselDots');
const carouselControls = document.getElementById('carouselControls');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const postsGrid = document.getElementById('postsGrid');

let currentSlide = 0;
let totalSlides = 0;

function goToSlide(index) {
  currentSlide = index;
  carouselTrack.style.transform = `translateX(-${index * 100}%)`;
  carouselDots.querySelectorAll('.carousel-dot').forEach((d, i) => {
    d.classList.toggle('on', i === index);
  });
  carouselPrev.classList.toggle('faded', index === 0);
  carouselNext.classList.toggle('faded', index === totalSlides - 1);
}

carouselPrev.addEventListener('click', () => {
  if (currentSlide > 0) goToSlide(currentSlide - 1);
});
carouselNext.addEventListener('click', () => {
  if (currentSlide < totalSlides - 1) goToSlide(currentSlide + 1);
});

function buildCarousel(media) {
  carouselTrack.innerHTML = '';
  carouselDots.innerHTML = '';
  totalSlides = media.length;
  currentSlide = 0;

  const isSingle = media.length === 1;

  media.forEach((item, i) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';

    if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.src;
      slide.appendChild(img);
    } else if (item.type === 'youtube') {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${item.id}`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      slide.appendChild(iframe);
    }

    carouselTrack.appendChild(slide);

    if (!isSingle) {
      const dot = document.createElement('span');
      dot.className = 'carousel-dot' + (i === 0 ? ' on' : '');
      dot.addEventListener('click', () => goToSlide(i));
      carouselDots.appendChild(dot);
    }
  });

  carouselControls.classList.toggle('hidden', isSingle);
  goToSlide(0);
}

function getLinkIcon(pdf) {
  if (pdf.type === 'pdf' || pdf.file.endsWith('.pdf')) return 'images/logos/pdf.svg';
  if (pdf.type === 'github' || pdf.file.includes('github.com')) return 'images/logos/github.svg';
  if (pdf.type === 'steam' || pdf.file.includes('store.steampowered.com')) return 'images/logos/steam.svg';
  if (pdf.type === 'itchio' || pdf.file.includes('itch.io')) return 'images/logos/itchio.svg';
  return null;
}

function openLightbox(post, card) {
  if (closeCleanupTimer) {
    clearTimeout(closeCleanupTimer);
    closeCleanupTimer = null;
  }
  lightboxTitle.textContent = post.title;
  lightboxDescription.textContent = post.description || '';
  lightboxLinks.innerHTML = '';

  if (post.links && post.links.length) {
    post.links.forEach(pdf => {
      const link = document.createElement('a');
      link.className = 'pdf-link';
      link.href = pdf.file;
      link.target = '_blank';
      link.rel = 'noopener';

      const iconSrc = getLinkIcon(pdf);
      if (iconSrc) {
        const icon = document.createElement('img');
        icon.src = iconSrc;
        icon.className = 'pdf-link-icon';
        icon.alt = '';
        link.appendChild(icon);
      }

      link.appendChild(document.createTextNode(pdf.label));

      const tooltip = document.createElement('span');
      tooltip.className = 'pdf-tooltip';
      tooltip.textContent = pdf.file.split('/').pop();
      link.appendChild(tooltip);
      lightboxLinks.appendChild(link);
    });
  }

  buildCarousel(post.media);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

let closeCleanupTimer = null;

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  closeCleanupTimer = setTimeout(() => {
    carouselTrack.innerHTML = '';
    carouselDots.innerHTML = '';
    closeCleanupTimer = null;
  }, 400);
}

lightboxBackdrop.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft' && currentSlide > 0) goToSlide(currentSlide - 1);
  if (e.key === 'ArrowRight' && currentSlide < totalSlides - 1) goToSlide(currentSlide + 1);
});

function buildCard(post) {
  const card = document.createElement('div');
  card.className = 'post-card';

  if (post.thumbnail) {
    const img = document.createElement('img');
    img.className = 'post-card-thumb';
    img.src = post.thumbnail;
    img.alt = post.title;
    card.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'post-card-thumb-placeholder';
    placeholder.textContent = 'no image';
    card.appendChild(placeholder);
  }

  const body = document.createElement('div');
  body.className = 'post-card-body';
  const title = document.createElement('h2');
  title.className = 'post-card-title';
  title.textContent = post.title;
  body.appendChild(title);
  card.appendChild(body);

  card.addEventListener('click', () => openLightbox(post, card));
  return card;
}

function getCenter(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function initHoverEffects(cards) {
  const restCenters = cards.map(c => getCenter(c));
  const heading = document.querySelector('.posts-heading');
  const headingRect = heading.getBoundingClientRect();
  const headingPos = { x: headingRect.left, y: headingRect.bottom };
  const pendingTimers = new Map();
  let leaveTimer = null;

  function cancelPending() {
    pendingTimers.forEach(id => clearTimeout(id));
    pendingTimers.clear();
  }

  function applyHover(card) {
    cancelPending();
    const hc = restCenters[cards.indexOf(card)];

    const headingDist = Math.sqrt(Math.pow(headingPos.x - hc.x, 2) + Math.pow(headingPos.y - hc.y, 2));
    const headingNudge = Math.max(0, 10 - headingDist * 0.012);
    const headingFade = 0.2;
    gsap.killTweensOf(heading);
    gsap.to(heading, { y: -headingNudge, opacity: headingFade, duration: 0.35, ease: 'power2.out', overwrite: true });

    cards.forEach((other, j) => {
      gsap.killTweensOf(other);

      if (other === card) {
        const pivotOffset = card.offsetHeight * 0.03;
        gsap.to(card, {
          scale: 1.06,
          x: 0,
          y: -pivotOffset,
          opacity: 1,
          boxShadow: '0 32px 80px rgba(26, 41, 44, 0.28)',
          duration: 0.35,
          ease: 'back.out(2)',
          overwrite: true
        });

        return;
      }

      const oc = restCenters[j];
      const dx = oc.x - hc.x;
      const dy = oc.y - hc.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const push = Math.max(0, 30 - dist * 0.04);
      const opacity = 1 - Math.min(0.35, dist * 0.0004);

      gsap.to(other, {
        scale: 0.94,
        opacity,
        x: (dx / dist) * push,
        y: (dy / dist) * push,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: true
      });
    });
  }

  function applyRest(fromCard) {
    cancelPending();
    const hc = restCenters[cards.indexOf(fromCard)];

    gsap.killTweensOf(heading);
    gsap.to(heading, { y: 0, opacity: 0.4, duration: 0.7, ease: 'elastic.out(0.6, 0.45)', overwrite: true });

    cards.forEach((other, j) => {

      gsap.killTweensOf(other);
      const oc = restCenters[j];
      const dist = Math.sqrt(Math.pow(oc.x - hc.x, 2) + Math.pow(oc.y - hc.y, 2));
      const ms = Math.round(dist * 0.1);

      setTimeout(() => {
        gsap.to(other, {
          scale: 1,
          opacity: 1,
          x: 0,
          y: 0,
          boxShadow: '0 12px 40px rgba(26, 41, 44, 0.13)',
          duration: 0.7,
          ease: 'elastic.out(0.6, 0.45)',
          overwrite: true
        });
      }, ms);
    });
  }

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
      applyHover(card);
    });

    card.addEventListener('mouseleave', () => {
      leaveTimer = setTimeout(() => {
        applyRest(card);
        leaveTimer = null;
      }, 80);
    });
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      gsap.to(entry.target, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

fetch('posts.json')
  .then(r => r.json())
  .then(posts => {
    const cards = [];
    posts.forEach((post, i) => {
      const card = buildCard(post);
      gsap.set(card, { opacity: 0, y: 30, transformOrigin: 'center center' });
      postsGrid.appendChild(card);
      observer.observe(card);
      cards.push(card);
    });
    initHoverEffects(cards);
  });