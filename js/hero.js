const words = [
  'programs.',
  'games.',
  'algorithms.',
  'a coffee.',
  'this website.',
  'music.',
  'another coffee.',
  'things.'
];

const cycler = document.getElementById('cycler');
const textEl = document.createElement('span');
textEl.className = 'typewriter-text';
cycler.appendChild(textEl);
const cursor = document.createElement('span');
cursor.className = 'typewriter-cursor';
cursor.textContent = '|';
cycler.appendChild(cursor);

const TYPE_BASE = 85;
const TYPE_VARIANCE = 55;
const DELETE_BASE = 25;
const DELETE_VARIANCE = 35;
const PAUSE_AFTER_TYPE = 1000;
const PAUSE_AFTER_DELETE = 180;
const MISTYPE_PAUSE = 400;

function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function typeSpeed() {
  return TYPE_BASE + randBetween(-TYPE_VARIANCE, TYPE_VARIANCE);
}

function deleteSpeed() {
  return DELETE_BASE + randBetween(-DELETE_VARIANCE, DELETE_VARIANCE);
}

function setCursorIdle(idle) {
  cursor.classList.toggle('cursor-idle', idle);
}

function typeWord(word, mistypeAt, onDone) {
  let i = 0;
  let mistakenAlready = false;

  function step() {
    const nextChar = word[i];

    if (mistypeAt === i && !mistakenAlready) {
      mistakenAlready = true;
      const wrongA = word[i + 1];
      const wrongB = word[i + 2] || word[i + 1];
      textEl.textContent += wrongA;
      setTimeout(() => {
        textEl.textContent += wrongB;
        setTimeout(() => {
          textEl.textContent = textEl.textContent.slice(0, -1);
          setTimeout(() => {
            textEl.textContent = textEl.textContent.slice(0, -1);
            setTimeout(() => {
              textEl.textContent += nextChar;
              i++;
              if (i < word.length) setTimeout(step, typeSpeed());
              else {
                setCursorIdle(true);
                setTimeout(onDone, PAUSE_AFTER_TYPE);
              }
            }, typeSpeed());
          }, deleteSpeed());
        }, MISTYPE_PAUSE);
      }, typeSpeed());
      return;
    }

    textEl.textContent += nextChar;
    i++;

    if (i < word.length) setTimeout(step, typeSpeed());
    else {
      setCursorIdle(true);
      setTimeout(onDone, PAUSE_AFTER_TYPE);
    }
  }

  setCursorIdle(false);
  setTimeout(step, typeSpeed());
}

function deleteWord(onDone) {
  setCursorIdle(false);
  function step() {
    if (textEl.textContent.length === 0) {
      setTimeout(onDone, PAUSE_AFTER_DELETE);
      return;
    }
    textEl.textContent = textEl.textContent.slice(0, -1);
    setTimeout(step, deleteSpeed());
  }
  step();
}

function getMistypeIndex(word) {
  const min = 1;
  const max = word.length - 4;
  if (max < min) return null;
  return randBetween(min, max);
}

function showScrollArrow() {
  const arrow = document.getElementById('scrollArrow');
  arrow.style.transition = 'opacity 0.8s ease';
  arrow.style.opacity = '0.35';
  arrow.addEventListener('click', () => {
    document.getElementById('postsSection').scrollIntoView({ behavior: 'smooth' });
  });
}

function runCycle() {
  let idx = 0;
  const last = words.length - 1;

  function next() {
    const shouldMistype = idx % 2 === 0 && idx < last;
    const mistypeAt = shouldMistype ? getMistypeIndex(words[idx]) : null;

    typeWord(words[idx], mistypeAt, () => {
      if (idx === last) {
        cursor.classList.add('cursor-hide');
        showScrollArrow();
        return;
      }
      deleteWord(() => {
        idx++;
        next();
      });
    });
  }

  next();
}

window.addEventListener('load', () => {
  gsap.to('#l1', { y: '0%', duration: 1, ease: 'power3.out', delay: 0.1 });
  gsap.to('#l2', { y: '0%', duration: 1, ease: 'power3.out', delay: 0.35, onComplete: runCycle });
});